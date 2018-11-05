import { connect } from 'react-redux';

import './PercentPair.sass';

export default class PercentPair extends React.Component {
    constructor(props) {
        super(props);
    };

    onCloseClick = () => {
        this.props.onDelete(this.props._id)
    };

    render() {
        const props = this.props;
        return (
            <div className="PercentPair" onClick={this.onCloseClick}>
                <h4>Symbol: {props.symbol}</h4>
                <p>Percent: {props.percent} %</p>
                <p>Current price: {props.close}</p>
                <p>Date: {props.updatedAt}</p>
            </div>
        );
    };
};