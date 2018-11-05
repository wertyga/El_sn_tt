import Input from '../Input/Input';

import './Option.sass';

export default class Option extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            setName: this.setName()
        };
    };

    componentDidUpdate(prevProps, prevState) {
        if(this.state.open !== prevState.open) {
            if(this.state.open) {
                document.body.addEventListener('click', this.bodyClose);
                document.body.addEventListener('keydown', this.bodyClose);
            } else {
                document.body.removeEventListener('click', this.bodyClose);
                document.body.removeEventListener('keydown', this.bodyClose);
            }
        };

        if(this.props.value !== prevProps.value) {
            this.setState({
                setName: this.setName()
            });
        };
    };

    setName = () => {
        const name = this.props.items.find(item => item.title === this.props.value);
        return name ? name.name : this.props.value
    };

    onClick = (e) => {
        const value = e.target.getAttribute('data-value');
        this.setState({
            open: !this.state.open
        });
        if(this.state.open) this.props.onClick(value);
    };

    bodyClose = (e) => {
        if(e.target.classList.contains('item')) return;
        if(e.keyCode === 27) {
            this.setState({ open: false });

        } else if(!e.keyCode) {
            this.setState({ open: false });

        };
    };

    render() {
        return (
            <div className={this.props.className ? `${this.props.className} Option` : 'Option'} onClick={this.optionClick} ref={node => this.mainRef = node} style={this.props.style}>
                <label>{this.props.label}</label>
                <div className="main-select">
                    {!this.props.loading ? <div className="upper">
                            <Input
                                type="text"
                                name="optionInput"
                                placeholder='Choose pair...'
                                // className={!this.props.disable ? 'default item' : 'default item disable'}
                                onClick={(e) => {
                                    if(this.props.disable) return;
                                    this.setState({open: !this.state.open});
                                }}
                                value={this.props.value}
                                onChange={e => {
                                    this.setState({ open: true});
                                    this.props.onChange(e);
                                }}
                                disabled={this.props.disabled}
                                inputRef={this.props.inputRef}
                                floatingText={this.props.floatingText}
                                error={this.props.error}
                            />

                        </div> :
                        <div className="loading">{this.props.loadingValue}</div>
                    }
                    {this.state.open && !this.props.loading && this.props.items.length > 0 &&
                    <div className="other-content">
                        {this.props.items.map((item, i) => {
                                return (
                                    <div
                                        style={{ display: item.title === this.props.value && 'none' }}
                                        className="item"
                                        data-value={item.title}
                                        key={i}
                                        onClick={this.onClick}
                                    >
                                        {item.count ? `${item.name} - ${item.count}` : item.name}
                                    </div>

                                );
                            }
                        )}
                    </div>
                    }
                </div>
            </div>
        );
    };
};

Option.propTypes = {
    onChange: PropTypes.func.isRequired, //Func for searching value
    label: PropTypes.string, // Label for select
    value: PropTypes.string.isRequired, //Current value of select
    items: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string.isRequired, //title of inner value of the select
        name: PropTypes.string.isRequired, //name of visible value of the select
    })).isRequired,
    emptyValue: PropTypes.string, //Empty value
    onClick: PropTypes.func.isRequired, //Function for changing between options with 'title' param
    loading: PropTypes.bool, //Loading
    loadingValue: PropTypes.node ,// Some value when is Loading
    disable: PropTypes.bool,// Boolean value for disabling
};