import './ButterMenu.sass'

const Menu = (props) => {
    return (
        <ul className="side_menu">
            {props.menu.map((item, i) => {
                if(item.onClick) {
                    return <li key={i}
                               onClick={item.onClick}
                               className={item.className ? classnames(Object.keys(item.className).reduce((obj, objItem) => {
                                   obj[objItem] = item.className[objItem];
                                   return obj;
                               }, {})) : undefined}
                    >{item.text}</li>
                } else {
                    return <li key={i}>{item.text}</li>
                }
            })}
        </ul>
    );
};

export default class ButterMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: this.props.open || false
        };
    };

    // componentDidMount() {
    //     if(this.f && this.s && this.t) {
    //         setTimeout(() => {
    //             this.f.classList.add('appear');
    //         }, 300);
    //         setTimeout(() => {
    //             this.s.classList.add('appear');
    //         }, 400);
    //         setTimeout(() => {
    //             this.t.classList.add('appear');
    //         }, 500)
    //     };
    // };

    componentDidUpdate(prevProps) {
        if(this.props.open && (this.props.open !== prevProps.open)) {
            this.setState({ open : this.props.open });
        }
    };

    onClick = e => {
        this.setState({ open : !this.state.open });
        if(this.props.onClick) this.props.onClick();
    };


    render() {

        const style = {
            div: {
                height: this.props.barHeight || 1
            }
        };

        return (
            <div className={classnames({
                ButterMenu: true,
                open: this.state.open,
                right: this.props.right,
                ...this.props.className
            })} onClick={this.onClick}>
                <div className="bars">
                    <div className='f' ref={node => this.f = node} style={style.div}></div>
                    <div className='s' ref={node => this.s = node} style={style.div}></div>
                    <div className='t' ref={node => this.t = node} style={style.div}></div>
                </div>
                {this.props.menu &&
                    <Menu
                        menu={this.props.menu}
                    />
                }
            </div>
        );
    }
};

ButterMenu.propTypes = {
    open: PropTypes.bool, // Control open menu [ default === this.state.open]
    right: PropTypes.bool, // Determinate from what side bars amd menu will be slide [ default === left]
    barHeight: PropTypes.number, // Height of bars [ default === 1]
    className: PropTypes.object, // Adding classNames view is { [key]: bool }
    menu: PropTypes.arrayOf(PropTypes.shape({
        text: PropTypes.string.isRequired, // Title of the list element
        onClick: PropTypes.func, // Function when click on list item
        className: PropTypes.object, // Object of classnames { [key]: [value] }
    })), // Array of objects that's mapping to side menu list
};