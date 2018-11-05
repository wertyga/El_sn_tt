// Power percents that reached more then 2% per 10sec(update prices time) OR get down more then 10% in 2h(default)
import { connect } from 'react-redux';
import isEmpty from 'lodash/isEmpty';

import { Link } from 'react-router-dom';

import clearSession from "../../common/functions/clearSession";

import { fetchPowerSymbols, deletePower } from '../../actions/api';

import PowerOne from '../PowerOne/PowerOne';

import './PowerPercents.sass';

class PowerPercents extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            errors: ''
        };
    };

    componentDidUpdate(prevProps) {
        if((this.props.user !== prevProps.user) && !isEmpty(this.props.user)) {
            this.setState({ loading: true });
            this.props.fetchPowerSymbols(this.props.user._id)
                .then(() => this.setState({ loading: false }))
                .catch(err => {
                    const errors = clearSession(this, err);
                    if(errors) this.setState({ errors });
                });
        };
    };

    deletePower = id => {
        return this.props.deletePower(id, this.props.user._id)
            .catch(err => {
                const errors = clearSession(this, err);
                if(errors) this.setState({ errors });
            })
    };

    render() {
        return (
            <div className="PowerPercents">
                <Link className="upper_black"
                      to={`/user/${this.props.user._id}`}
                >
                    <i className="fas fa-angle-left"></i>
                    <p>Power symbols</p>
                </Link>

                {this.state.errors && <div className="error">{this.state.errors}</div>}

                <div className="power_wrapper">
                    {this.props.powers.map(item =>
                        <PowerOne
                            key={item._id}
                            item={item}
                            history={this.props.history}
                        />
                    )}
                    {this.props.powers.length < 1 && !this.state.loading && <div className="empty">This stash is empty now</div>}
                </div>
            </div>
        );
    };
};

PowerPercents.propTypes = {
    powers: PropTypes.array.isRequired, // Array of power symbols
    user: PropTypes.object.isRequired, // Object with user data
    fetchPowerSymbols: PropTypes.func.isRequired, // Fetch power symbols when component just mounted and still stay without socket data
};

const mapState = state => {
    return {
        powers: state.powerPercents,
        user: state.user
    }
};

export default connect(mapState, { fetchPowerSymbols })(PowerPercents);