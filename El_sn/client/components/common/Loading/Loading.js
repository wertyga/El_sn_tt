import './Loading.sass';

export default () => {
    return (
        <div className="Loading">
            <div className="cssload-loader">
                <div className="cssload-inner cssload-one"></div>
                <div className="cssload-inner cssload-two"></div>
                <div className="cssload-inner cssload-three"></div>
            </div>
            <div style={{ textAlign: 'center', marginTop: 30 }}>Loading...</div>
        </div>
    );
};