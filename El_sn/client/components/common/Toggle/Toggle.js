import './Toggle.sass';

export default class Toggle extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: this.props.open
        };
    };

    onChange = async () => {
        await this.setState({
            open: !this.state.open
        });
        this.props.onChange();
    };

    render() {
        return (
            <div className="Toggle">
                <div onClick={this.onChange} className={this.state.open ? 'route open' : 'route'}>
                    <div className="thumb"></div>
                </div>
                {this.props.label && <div className="label">{this.props.label}</div>}
            </div>
        );
    };
};