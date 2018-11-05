import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { userAuth } from '../../actions/auth';

import inputsValidation from '../../../server/middlewares/inputsValidation';

import Loading from '../common/Loading/Loading';

import Input from '../common/Input/Input';

import './LogInScreen.sass';

export class LogInScreen extends React.Component {
    constructor() {
        super();

        this.state = {
            username: '',
            password: '',
            errors: {},
            loading: false
        };
    };

    componentDidMount() {
        this.usernameInputRef.focus();
    };

    onChange = e => { // Change handler of input
        const name = e.target.name;
        this.setState({
            [name]: e.target.value,
            errors: {
                ...this.state.errors,
                [name]: ''
            }
        });
    };

    Submit = login => { // Login user
        const sendObject = {
            username: {
                field: this.state.username,
                require: true
            },
            password: {
                field: this.state.password,
                require: true
            }
        };
        const { isValid, errors } = inputsValidation(sendObject);

        if(isValid) {
            this.setState({ loading: true, errors: {}});
            const url = '/auth/login';
            this.props.userAuth({...sendObject, url })
                .then(id => this.props.history.push(`/user/${id}`))
                .catch(err => {
                    this.setState({
                        loading: false,
                        errors: err.response ? err.response.data.errors : { globalError: err.message }
                    });
                })
        } else {
            this.setState({
                errors
            })
        }
    };

    signup = () => {
        this.props.history.push('/user/sign-up')
    };

    render() {
        return (
            <div className="LogInScreen">
                <div className="login_header" onClick={this.backToLogin}><p>Login</p></div>
                <form className="form" onSubmit={this.Submit}>
                    {this.state.errors.globalError && <div className="error">{this.state.errors.globalError}</div>}
                    {this.state.loading  && <Loading />}

                    <Input
                        placeholder="Enter username..."
                        value={this.state.username}
                        onChange={this.onChange}
                        name="username"
                        floatText='Username'
                        error={this.state.errors.username}
                        disabled={this.state.loading}
                        inputRef={node => this.usernameInputRef = node}
                    />

                    <Input
                        placeholder="Enter password..."
                        value={this.state.password}
                        onChange={this.onChange}
                        name="password"
                        floatText='Password'
                        type="password"
                        error={this.state.errors.password}
                        disabled={this.state.loading}
                    />

                    <div className="buttons">
                        <button className="primary submit_button"
                                onClick={this.Submit}
                                disabled={this.state.loading || !this.state.username || !this.state.password}
                                type="submit"
                        >
                            Sign-In
                        </button>
                        <button className="primary signup_button"
                                onClick={this.signup}
                                disabled={this.state.loading}
                        >
                            Sign-Up/Registration
                        </button>
                    </div>

                    <Link to="/remind" className="remind">Forgot password?</Link>

                </form>
            </div>
        );
    };
};

LogInScreen.propTypes = {
    userAuth: PropTypes.func.isRequired, //Login and registration action
};

export default connect(null, { userAuth })(LogInScreen);


