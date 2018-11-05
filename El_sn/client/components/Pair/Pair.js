import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';

import { updatePrice } from '../../actions/api';

import './Pair.sass';

class Pair extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            name: `${this.props.baseAsset}/${this.props.quoteAsset}`,
            diffPrice: 0,
            errors: '',
            loading: false
        };
    };

    componentDidMount() {
        this.comparePriceDifferent();
    };

    componentDidUpdate(prevProps) {
        if(this.props.price !== prevProps.price || this.props.prevPrice !== prevProps.prevPrice) {
            this.comparePriceDifferent();
        };
        if((this.props.sign !== prevProps.sign) && this.props.sign) {
            ipcRenderer.send('reached_sign_price', {
                signPrice: this.props.signPrice,
                time: this.props.updatedAt,
                symbol: this.props.symbol
            })
        };
    };


    comparePriceDifferent = () => { // Compare different between current - and previous price
        const diffPrice = (this.props.price - this.props.prevPrice).toFixed(8);
        if(diffPrice < 0) {
            this.setState({
                diffPrice
            });
        } else {
            this.setState({
                diffPrice: `+${diffPrice}`
            });
        }
    };

    onClose = () => {
        if(this.state.loading) return;
        this.setState({ loading: true });
        this.props.onClose(this.props._id)
            .catch(err => this.setState({ errors: err.response ? err.response.data : err.message}))
    };

    render() {

        const downStyle = {
            transform: 'rotate(180deg)'
        };

        return (
            <div className={classnames({
                Pair: true,
                sign: this.props.sign
            })}
                 onClick={this.onClose}
                 onMouseDown={e => e.currentTarget.classList.add('active')}
                 onMouseUp={e => e.currentTarget.classList.remove('active')}
            >

                <div className="title"><span>{this.state.name.split('/')[0]}</span><span>/</span><span>{this.state.name.split('/')[1]}</span></div>
                {this.state.errors && <div className="error">{this.state.errors}</div>}
                <div className="content">
                    <p className="price"><span>Purpose price: </span><strong>{this.props.signPrice.toFixed(8)}</strong></p>
                    <p className="price"><span>Current price: </span><strong>{this.props.price.toFixed(8)}</strong></p>

                    <p className={this.state.diffPrice > 0 ? 'arrow green' : 'arrow red'}>
                        <strong>{this.state.diffPrice}</strong>
                        <i className="fas fa-arrow-alt-circle-up"></i>
                    </p>


                    <p className="price"><span>Previous price: </span><strong>{this.props.prevPrice.toFixed(8)}</strong></p>

                    {this.props.sign &&
                        <div className="signTime">Reached time:
                            <strong>{this.props.updatedAt.split('.')[0].split('T').join(' ')}</strong>
                        </div>
                    }
                </div>

                {/*<button className="close danger" onClick={this.onClose} disabled={this.state.loading}>Delete</button>*/}
            </div>
        );
    };
};

export default connect(null, { updatePrice })(Pair);
