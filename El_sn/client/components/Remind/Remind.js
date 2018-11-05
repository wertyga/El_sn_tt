import { connect } from 'react-redux';

import { Link } from 'react-router-dom';

import { remindPass, changePass } from '../../actions/auth';

import inputValidation from '../../../server/common/functions/inputsValidation';

import Input from '../common/Input/Input';
import Loading from '../common/Loading/Loading';

import './Remind.sass';

class Remind extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            verifyCode: '',
            password: '',
            passwordConfirm: '',
            loading: false,
            changePass: false,
            modal: false,
            errors: {}

        };
    };

    onChange = e => {
        this.setState({
            [e.target.name]: e.target.value,
            errors: {
                ...this.state.errors,
                [e.target.name]: '',
            }
        });
    };

    onSubmit = () => {
        if(!this.state.username) {
            this.setState({ errors: { username: 'Field can not be blank' } });
        } else {
            this.setState({ loading: true });
            this.props.remindPass(this.state.username)
                .then(() => {
                    this.setState({ loading: false, changePass: true, modal: true });
                })
                .catch(err => {
                    this.setState({ loading: false, errors: err.response ? err.response.data.errors : { globalError: err.message } });
                })
        };
    };

    changePass = () => { // Changing password
        const inputsObj = {
            verifyCode: {
                field: this.state.verifyCode,
                require: true
            },
            password: {
                field: this.state.password,
                require: true
            },
            passwordConfirm: {
                field: this.state.passwordConfirm,
                require: true
            },
        };

        const { isValid, errors } = inputValidation(inputsObj);

        if(!isValid) {
            this.setState({ errors });
        } else {
            this.setState({ loading: true });
            this.props.changePass(inputsObj)
                .then(() => {
                    this.props.history.replace('/')
                })
                .catch(err => {
                    this.setState({
                        loading: false,
                        errors: err.response ? err.response.data.errors : { globalError: err.message }
                    });
                })
        }
    };

    closeModal = () => { // Close modal window that appears while verify code was sent to user's email
        this.setState({ modal: false });
    };

    onFocusInput = () => {
        this.setState({
            errors: {
                ...this.state.errors,
                globalError: '',
            }
        });
    };

    render() {

        const username = (
            <Input
                placeholder="Enter username..."
                value={this.state.username}
                onChange={this.onChange}
                name="username"
                floatText='Username'
                error={this.state.errors.username}
                disabled={this.state.loading}
                onFocus={this.onFocusInput}
            />
        );

        const changePass = [
            <Input
                key='verifyCode'
                placeholder="Enter verify code..."
                value={this.state.verifyCode}
                onChange={this.onChange}
                name="verifyCode"
                floatText='Verify code'
                error={this.state.errors.verifyCode}
                disabled={this.state.loading}
                onFocus={this.onFocusInput}
            />,
            <Input
                key='password'
                placeholder="Enter new password..."
                value={this.state.password}
                onChange={this.onChange}
                name="password"
                floatText='New password'
                error={this.state.errors.password}
                disabled={this.state.loading}
                onFocus={this.onFocusInput}
            />,
            <Input
                key='passwordConfirm'
                placeholder="Confirm password..."
                value={this.state.passwordConfirm}
                onChange={this.onChange}
                name="passwordConfirm"
                floatText='Confirm password'
                error={this.state.errors.passwordConfirm}
                disabled={this.state.loading}
                onFocus={this.onFocusInput}
            />
        ];

        const modal = (
            <div className="modal">
                <p>Verification code was send to registered E-mail</p>
                <button className="btn primary" onClick={this.closeModal}>OK</button>
            </div>
        );

        return (
            <div className="Remind">
                {this.state.loading && <Loading />}
                {this.state.modal && modal}
                <Link className="upper_black" to='/'><i className="fas fa-angle-left"></i><p>Reestablish password</p></Link>

                {this.state.errors.globalError && <div className="error">{this.state.errors.globalError}</div>}

                <div className="input">
                    <h5>{this.state.changePass ? 'Enter verification code and new password' : 'Enter login that you have been registered'}</h5>

                    {this.state.changePass ? changePass : username}

                    <div className="buttons">
                        {this.state.changePass ?
                            <button className="btn primary" disabled={this.state.loading} onClick={this.changePass}>Change password</button> :
                            <button onClick={this.onSubmit} className="btn primary" disabled={this.state.loading}>Confirm</button>
                        }
                    </div>
                </div>
            </div>
        );
    };
};

export default connect(null, { remindPass, changePass })(Remind);