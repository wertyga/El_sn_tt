import { Link } from 'react-router-dom';

const noFound = () => {
    return (
        <div className="not-found-page"
             style={{
                 width: '100%',
                 display: 'flex',
                 alignItems: 'center',
                 flexDirection: 'column',
                 paddingTop: '200px'
             }}>
           <Link className="upper_black"
                 to="/"
                 style={{
                    position: 'fixed',
                    top: 0,
                 }}
           >
              <i className="fas fa-angle-left"></i>
              <p>Go to main page</p>
           </Link>
            <h2>Page not found</h2>
            <h1>404 Error</h1>
        </div>
    );
};

export default noFound;
