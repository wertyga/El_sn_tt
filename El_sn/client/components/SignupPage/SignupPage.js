import { connect } from 'react-redux';

import Input from '../common/Input/Input';
import Loading from '../common/Loading/Loading';

import { userSignUp } from '../../actions/auth';

import validateInputs from '../../../server/middlewares/inputsValidation';

import './SignupPage.sass';

class SignupPage extends React.Component {
    constructor() {
        super();

        this.state = {
            password: '',
            username: '',
            email: '',
            loading: false,
            errors: {}
        };
    };

    onChange = e => {
        this.setState({
            [e.target.name]: e.target.value,
            errors: {
                ...this.state.errors,
                [e.target.name]: ''
            }
        });
    };

    onSubmit = () => {
        const sendObj = {
            password: {
                field: this.state.password,
                require: true
            },
            username: {
                field: this.state.username,
                require: true
            },
            email: {
                field: this.state.email,
                require: true
            }
        };

        const { isValid, errors } = validateInputs(sendObj);
        if(isValid) {
            this.setState({ loading: true, errors: {}});
            const url = '/auth/sign-up';
            this.props.userSignUp({...sendObj, url })
                .then(res => this.props.history.push(`/verify/${res.data._id}`))
                .catch(err => {
                    this.setState({
                        loading: false,
                        errors: err.response ? err.response.data.errors : { globalError: err.message }
                    });
                })
        } else {
            this.setState({ errors })
        }
    };

    backToLogin = () => {
        this.props.history.push('/')
    };

    render() {
        return (
            <div className="SignupPage">
                <div className="upper_black back_to_login" onClick={this.backToLogin}><i className="fas fa-angle-left"></i><p>Signup</p></div>
                {this.state.loading && <Loading />}
                {this.state.errors.globalError && <div className="error">{this.state.errors.globalError}</div>}
                <div className="inputs">
                    <Input
                        placeholder="Enter username..."
                        name="username"
                        value={this.state.username}
                        error={this.state.errors.username}
                        floatText="Username"
                        onChange={this.onChange}
                        disabled={this.state.loading}
                    />
                    <Input
                        placeholder="Enter password..."
                        name="password"
                        value={this.state.password}
                        error={this.state.errors.password}
                        floatText="Password"
                        onChange={this.onChange}
                        disabled={this.state.loading}
                    />
                    <Input
                        placeholder="Enter e-mail..."
                        name="email"
                        value={this.state.email}
                        error={this.state.errors.email}
                        floatText="E-mail"
                        onChange={this.onChange}
                        disabled={this.state.loading}
                    />

                    <button className="primary" disabled={this.state.loading} onClick={this.onSubmit}>Sign up</button>
                </div>
            </div>
        );
    };
};

export default connect(null, { userSignUp })(SignupPage);
