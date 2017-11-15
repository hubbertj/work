export{}

declare global {
    interface String {
    format(...replacements: string[]): string;
    }
}

String.prototype.format = function() {
    var args = arguments;

    return this.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined'
            ? args[number]
            : match;
    });
};