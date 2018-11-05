import LoginScreen from '../components/LogInScreen/LogInScreen';;
import SignupPage from '../components/SignupPage/SignupPage';
import NotFound from '../components/404/404';
import SocketWrapper from '../components/SocketWrapper/SocketWrapper';
import Remind from '../components/Remind/Remind';
import VerifyUser from '../components/VerifyUser/VerifyUser';

export default [
    {
        path: '/',
        exact: true,
        component: LoginScreen
    },
    {
        path: '/user/sign-up',
        component: SignupPage
    },
    {
        path: '/remind',
        component: Remind
    },
    {
        path: '/user/:id',
        component: SocketWrapper
    },
   {
      path: '/verify/:userID',
      component: VerifyUser
   },
    {
        path: '/*',
        component: NotFound
    }
]
