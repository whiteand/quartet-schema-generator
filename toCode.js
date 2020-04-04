module.exports = function toCode(value) {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (typeof value ==='string') return JSON.stringify(value)
    return value.toString()
}
