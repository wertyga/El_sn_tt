export default (self, err) => {
    const error = err.response ? err.response.data : err.message;
    if(err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        self.props.history.push(error.redirect || '/')
        return false;
    } else {
        return error;
    };
};