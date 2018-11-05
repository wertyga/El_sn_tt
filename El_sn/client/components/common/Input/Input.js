import './Input.sass';

class Input extends React.Component{
    constructor() {
        super();

        this.state = {
            value: '',
            focus: false
        };
    };


    onFocus = () => {
        this.setState({
            focus: true
        });
        this.props.onFocus && this.props.onFocus();
    }

    onBlur = () => {
        this.setState({
            focus: false
        });
    }

    onChange = (e) => {
        this.setState({
            value: e.target.value
        });
    }

    render() {

        const styles = this.props.style || {};

        return (
            <div className={this.state.focus ? 'focus Input' : 'Input'} style={{ color: this.props.error && 'red', ...styles }} >
                {this.props.label && <div className="label">{this.props.label}</div>}
                <div style={{ position: 'relative' }}>
                    <input
                        onClick={this.props.onClick}
                        ref={this.props.inputRef}
                        onFocus={this.onFocus}
                        onBlur={this.onBlur}
                        type={this.props.type || 'text'}
                        style={{
                            ...styles,
                            color: this.props.error && 'red'
                        }}
                        placeholder={this.props.placeholder}
                        className={this.state.focus ? 'focus' : undefined}
                        value={this.props.value}
                        onChange={e => this.props.onChange(e)}
                        name={this.props.name}
                        disabled={this.props.disabled}
                    />
                    <div className="borderBottom"></div>
                    <div  className={(this.state.focus || (this.props.value || this.state.value)) ? 'focus floatText' : 'floatText'}
                          style={{ color: this.props.error ? 'red' : (this.props.disabled && 'rgb(150, 150, 150)') }}
                    >
                        {this.props.floatText}
                    </div>
                    <div className={(this.state.focus && !this.props.disabled) ? 'focus after' : 'after'}></div>
                </div>
                {this.props.error && <div className="error">{this.props.error}</div>}
            </div>

        );
    }
};

Input.propTypes = {
    type: PropTypes.string, // Type of Input
    style: PropTypes.object, // Style of Input
    placeholder: PropTypes.string, // Placeholder of Input
    value: PropTypes.string, // Value of Input
    onChange: PropTypes.func.isRequired, // OnChange of Input
    name: PropTypes.string.isRequired, // Name of Input
    error: PropTypes.string, // Error of Input
    floatText: PropTypes.string, // FloatText of Input
    disabled: PropTypes.bool, // Disabled of Input
    onClick: PropTypes.func, // Function for invoke some behavior when clicked on input
    onFocus: PropTypes.func, // Function to react on focus event
    // ref: PropTypes.element, // Reference to this Input

};

export default Input;