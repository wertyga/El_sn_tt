export default function filterObject(obj, fields) {
    if(!(fields instanceof Array)) fields = [fields];

    return Object.keys(obj)
        .filter(item => {
            if(fields.indexOf(item) !== -1) {
                return false;
            } else {
                return true;
            }
        })
        .reduce((init, item) => {
            init[item] = obj[item]
            return init;
        }, {});
};