import FlipMove from 'react-flip-move';

import clearSession from "../../../common/functions/clearSession";

import Loading from '../Loading/Loading';
import Input from '../Input/Input';

import './ChangableInput.sass';


export default class ChangableInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: this.props.text,
            text: this.props.text,
            editing: false,
            loading: false,
            errors: ''
        };
    };

    componentDidUpdate(prevProps, prevState) {
        if(this.state.editing !== prevState.editing) {
            if(this.state.editing) {
                this.input.focus();
                this.props.isEditing(this.props.name);
            } else {
                this.input.blur();
                this.props.isEditing('');
            }
        };
    };

    onFocus = () => {
        this.input.addEventListener('keyup', this.inputKeyPress);
        document.body.addEventListener('click', this.bodyEvents);
    };

    bodyEvents = e => {
        this.onEmptyClick(e);
    };

    onEmptyClick = (e) => {
        if(e.target !== this.input) {
            this.cancelChanging();
        };
    };

    inputKeyPress = e => {
        if(e && e.keyCode === 13) {
            this.confirmChanging();
        } else if(e && e.keyCode === 27){
            this.cancelChanging();
        };
    };

    onChangeInput = e => {
        this.setState({
            value: e.target.value,
            errors: ''
        });
        this.props.clearError && this.props.clearError();
    };

    confirmChanging = () => {
        if(this.state.value === this.state.text) {
            this.cancelChanging();
            return;
        }
        const errors = this.props.validateText && this.props.validateText(this.state.value);
        if(!this.state.value || errors) {
            this.setState({ errors: errors || 'Field can not be blank' });
            return;
        };

        return this.props.confirmChanging && this.props.confirmChanging(this.state.value)
            .then(() => {
                this.setState({ text: this.state.value, editing: false });
                this.input.removeEventListener('keyup', this.inputKeyPress);
                document.body.removeEventListener('click', this.bodyEvents);
            })
            .catch(err => {
                const errors = clearSession(this, err);
                if(errors) {
                    this.setState({ errors: clearSession(this, err), loading: false });
                }
            })
    };

    cancelChanging = () => {
        this.setState({ value: this.state.text, editing: false, errors: '' });
        this.input.removeEventListener('keyup', this.inputKeyPress);
        document.body.removeEventListener('click', this.bodyEvents);
    };

    render() {

        const enter = {
                from: {
                    transform: 'translateX(-50%)',
                    opacity: 0
                },
                to: {
                    transform: 'translateX(0)',
                    opacity: 1
                }
            },
            leave = {
                from: {
                    transform: 'translateX(0)',
                    opacity: 1
                },
                to: {
                    transform: 'translateX(-50%)',
                    opacity: 0
                }
            }

        return (
            <div className="ChangableInput" onClick={() => this.setState({ editing: true })}>
                {this.state.loading && <Loading />}
                <FlipMove enterAnimation={enter} leaveAnimation={leave}>
                    {this.state.editing && <Input type="text"
                                                  inputRef={node => this.input = node}
                                                  onChange={this.onChangeInput}
                                                  value={this.state.value}
                                                  disabled={this.props.disabled}
                                                  name={this.props.name}
                                                  // floatText={this.props.floatText}
                                                  error={this.state.errors}
                                                  onFocus={this.onFocus}
                    />}
                    {!this.state.editing && <div className="text">{this.state.text}</div>}
                </FlipMove>
            </div>
        );
    };
};

ChangableInput.propTypes = {
    text: PropTypes.string.isRequired, // Simple text
    disabled: PropTypes.bool, // Disable input
    confirmChanging: PropTypes.func, // Function to confirm changing in parent component, that returns changed text (like: fetching changing to DB)
    validateText: PropTypes.func, // Validate text changing from parent component
    isEditing: PropTypes.func, // Sign if component is editing now
    name: PropTypes.string, // Input field name
};