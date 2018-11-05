import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';

import clearSession from "../../common/functions/clearSession";

import { setSeenPower, deletePower } from '../../actions/api';

import './PowerOne.sass';

class PowerOne extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            errors: ''
        };
    };

    componentWillUnmount() {
        window.removeEventListener('scroll', this.bodyScroll)
    };

    componentDidMount() {
        window.addEventListener('scroll', this.bodyScroll);
        setTimeout(this.bodyScroll, 1000);
    };

    bodyScroll = () => {
        if(!this.mainRef) return;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const  { bottom }  = this.mainRef.getBoundingClientRect();
        const totalHeight = scrollTop + window.innerHeight;

        if((totalHeight > (bottom + 50 + scrollTop)) && !this.props.item.isSeen) {
            this.props.setSeenPower(this.props.user._id, this.props.item._id)
                .catch(err => {
                    const errors = clearSession(this, err);
                    if(errors) this.setState({ errors });
                })
        };
    };

    deletePower = () => {
        return this.props.deletePower(this.props.item._id, this.props.user._id)
            .catch(err => {
                const errors = clearSession(this, err);
                if(errors) this.setState({ errors });
            })
    };

    render() {
        const item = this.props.item;
        const quoteAsset = item.symbol.match(/BTC|ETH/);
        return (
            <div className={classnames({ PowerOne: true, new: !item.isSeen })}
                 onClick={this.deletePower}
                 onMouseDown={e => e.currentTarget.classList.add('active')}
                 onMouseUp={e => e.currentTarget.classList.remove('active')}
                 ref={node => this.mainRef = node}
            >
                {this.state.errors && <div className="error">{this.state.errors}</div>}
                <div className="symbol">
                   <strong>{item.symbol.indexOf('USDT') !== -1 ? 'USDT' : item.symbol.split(quoteAsset)[0]}</strong>
                   <span>/ {quoteAsset}</span>
                </div>
                <div className={classnames({ percent: true, positive: item.percent > 0, negative: item.percent < 0})}>
                    {item.percent > 0 && <span>Grow for <strong>+ {item.percent} %</strong></span>}
                    {item.percent < 0 && <span>Crash down for <strong>{item.percent} %</strong></span>}
                </div>
                {item.close && item.high &&
                    <div className="high">
                        <span>From: </span><strong>{item.percent > 0 ? item.low.toFixed(8) : item.high.toFixed(8)}</strong>
                        <span>To: </span><strong>{item.close.toFixed(8)}</strong>
                    </div>
                }
                <div className="date">{item.updatedAt.replace('Z', '').split('T').join(' ')}</div>
            </div>
        );
    };
};

PowerOne.propTypes = {
    user: PropTypes.object.isRequired, // User data
    item: PropTypes.object.isRequired, // Data for powerOne element
    deletePower: PropTypes.func.isRequired, // Delete power symbol element
    setSeenPower: PropTypes.func.isRequired, // Function for set power one to { isSeen: true }
    history: PropTypes.object.isRequired, // React route history for redirecting while errors
};

const mapState = state => {
    return {
        user: state.user
    };
};

export default connect(mapState, { setSeenPower, deletePower })(PowerOne);
