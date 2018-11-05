import { connect } from 'react-redux';

import Loading from '../common/Loading/Loading';
import Input from '../common/Input/Input';
import { verifyUserCodeWithSignUp } from "../../actions/auth";

class VerifyUser extends React.Component {
   constructor() {
      super();

      this.state = {
         loading: false,
         verifyCode: '',
         errors: {},
      };
   };

   onChange = e => {
      this.setState({
         verifyCode: e.target.value,
      });
   };

   backToLogin = () => {
      this.props.history.push('/')
   };

   submit = (e) => {
      e.preventDefault();
      this.setState({ loading: true });
      const { userID } = this.props.match.params;
      const { verifyCode } = this.state;
      this.props.verifyUserCodeWithSignUp(userID, verifyCode)
        .then(id => {
           this.props.history.push(`/user/${id}`)
        })
        .catch(e => {
           this.setState({
              errors: e.response ? e.response.data.errors : { globalError: e.message },
              loading: false,
           })
        });
   };

   render() {
      return (
        <div className="LogInScreen">
           <div className="upper_black back_to_login" onClick={this.backToLogin}>
              <i className="fas fa-angle-left"></i>
              <p>Verify code</p>
           </div>
           <form className="form" onSubmit={this.submit}>
              {this.state.errors.globalError && <div className="error">{this.state.errors.globalError}</div>}
              {this.state.loading  && <Loading />}

              <Input
                placeholder="Enter verify code..."
                value={this.state.verifyCode}
                onChange={this.onChange}
                name="Verify code"
                floatText='Verify code'
                error={this.state.errors.verifyCode}
                disabled={this.state.loading}
              />
              <button className="primary submit_button"
                      disabled={this.state.loading || !this.state.verifyCode}
                      type="submit"
              >
                 Verify
              </button>

           </form>
        </div>
      );
   };
};

export default connect(null, { verifyUserCodeWithSignUp })(VerifyUser);
