import { connect } from 'react-redux';

import { confirmChanging, subscribing } from '../../actions/api';

import { validateEmail } from '../../../server/middlewares/inputsValidation'

import ChangableInput from '../common/ChangableInput/ChangableInput';
import Loading from '../common/Loading/Loading';

import './Settings.sass';

class Settings extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            littleLoading: false,
            isEditing: '',
            errors: ''
        }
    };

    confirmChanging = (id, sign, text) => {
        return this.props.confirmChanging(id, sign, text)
            .then(() => this.setState({ loading: false }))
            .catch(err => {
                throw err;
            })
    };

    clearError = () => { this.setState({ errors: ''}) };

    validateEmailData = email => {
        if(!validateEmail(email)) {
            return 'E-mail not confirmed'
        } else {
            return false;
        };
    };

    isEditing = inputName => { this.setState({ isEditing: inputName }) };

    subscribing = (sign) => {
        const sendObj = {
            main: sign === 'main' ? !this.props.user.isReceiveMail.main : this.props.user.isReceiveMail.main,
            power: sign === 'power' ? !this.props.user.isReceiveMail.power : this.props.user.isReceiveMail.power,
        };
        this.setState({ littleLoading: true, errors: '' });
        this.props.subscribing(this.props.user._id, sendObj)
            .then(() => {
                this.setState({
                    littleLoading: false
                })
            })
            .catch(err => {
                if(err.response && err.response.status === 401) {
                    this.setState({
                        littleLoading: false,
                        errors: 'Access denided: reload the application'
                    })
                } else if(err.response && err.response.status === 403 && err.response.data.redirect) {
                    this.props.history.replace(err.response.data.redirect);
                } else {
                    this.setState({
                        littleLoading: false,
                        errors: err.response ? err.response.data.errors : err.message
                    })
                };
            })
    };

    render() {

        return (
            <div className="Settings">
                {this.state.loading && <Loading />}
                <h2>Settings:</h2>
                {this.state.errors && <div className="error">{this.state.errors}</div>}
                <div className={classnames({ username: true, edit: this.state.isEditing === 'username' })}><span>Name: </span>
                    <ChangableInput
                        text={this.props.user.username}
                        confirmChanging={(text) => this.confirmChanging(this.props.user._id, 'username', text)}
                        clearError={this.clearError}
                        disabled={this.state.loading}
                        history={this.props.history}
                        isEditing={this.isEditing}
                        name="username"
                        // floatText="Username"
                    />
                </div>
                <div className={classnames({ username: true, edit: this.state.isEditing === 'email' })}><span>E-mail: </span>
                    <ChangableInput
                        text={this.props.user.email}
                        confirmChanging={(text) => this.confirmChanging(this.props.user._id, 'email', text)}
                        clearError={this.clearError}
                        disabled={this.state.loading}
                        validateText={this.validateEmailData}
                        history={this.props.history}
                        isEditing={this.isEditing}
                        name="email"
                    />
                </div>
                <div className="extention"><span>Is extention account:</span>
                    {this.props.user.isCool ? <span className="positive">Yes</span> : <span className="negative">No</span>}
                </div>
                <div className="subscribe">
                    <span>Subscribing to e-mail sending: </span>
                    <input type="checkbox"
                           checked={this.props.user.isReceiveMail.main}
                           onChange={() => this.subscribing('main')}
                           disabled={this.state.littleLoading}
                           value={this.props.user.isReceiveMail.main}
                    />
                </div>
                {this.props.user.isCool &&
                    <div className="subscribe">
                        <span>Subscribing to e-mail sending for power symbols: </span>
                        <input type="checkbox"
                               checked={this.props.user.isReceiveMail.power}
                               onChange={() => this.subscribing('power')}
                               disabled={this.state.littleLoading}
                               value={this.props.user.isReceiveMail.power}
                        />
                    </div>
                }
            </div>
        );
    };
};

const mapState = state => {
    return {
        user: state.user
    }
};

Settings.propTypes = {
    user: PropTypes.object.isRequired, // User data
    confirmChanging: PropTypes.func.isRequired, // Dispatch to DB for changing user data
};

export default connect(mapState, { confirmChanging, subscribing })(Settings);