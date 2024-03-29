export class TestCase {
    private _error: boolean = false;
    private _failure: boolean = false;
    private _skipped: boolean = false;
    private _standardOutput?: string = undefined;
    private _standardError?: string = undefined;
    private _stacktrace?: any = undefined;
    private _attributes: any = {};
    private _errorAttributes: any = {};
    private _failureAttributes: any = {};
    private _errorAttachment?: any = undefined;
    private _errorContent?: string = undefined;
    private _properties: any = [];

    public className(className: string) {
        this._attributes.classname = className;
        return this;
    }

    public id(className: string) {
        this._attributes.id = className;
        return this;
    }

    public name(name: string) {
        this._attributes.name = name;
        return this;
    }

    public time(timeInSeconds: number) {
        this._attributes.time = timeInSeconds;
        return this;
    }

    public browserName(browserName: string) {
        this._attributes.browserName = browserName;
        return this;
    }

    public deviceName(deviceName: string) {
        this._attributes.deviceName = deviceName;
        return this;
    }

    public failure(message: string, type: any) {
        this._failure = true;

        if (message) {
            this._failureAttributes.message = message;
        }
        if (type) {
            this._failureAttributes.type = type;
        }
        return this;
    }

    public error(message: string, type: any, content: string) {
        this._error = true;
        if (message) {
            this._errorAttributes.message = message;
        }
        if (type) {
            this._errorAttributes.type = type;
        }
        if (content) {
            this._errorContent = content;
        }
        return this;
    }

    public stacktrace(stacktrace: string) {
        this._failure = true;
        this._stacktrace = stacktrace;
        return this;
    }

    property(name: string, value: any) {
        this._properties.push({ name, value });
        return this;
    }

    skipped() {
        this._skipped = true;
    }

    standardOutput(log: string) {
        this._standardOutput = log;
    }

    standardError(log: string) {
        this._standardError = log;
    }

    getFailureCount() {
        return Number(this._failure);
    }

    getErrorCount() {
        return Number(this._error);
    }

    getSkippedCount() {
        return Number(this._skipped);
    }

    errorAttachment(path: string) {
        this._errorAttachment = path;
    }

    build(parentElement: any) {
        const testCaseElement = parentElement.ele('testcase', this._attributes);
        // add <properties> child element
        if (this._properties.length) {
            const propertiesElement = testCaseElement.ele('properties');
            for (const property of this._properties) {
              propertiesElement.ele('property', {
                name: property.name,
                value: property.value,
              });
            }
        }
        if (this._failure) {
            const failureElement = testCaseElement.ele('failure', this._failureAttributes);
            if (this._stacktrace) {
                failureElement.cdata(this._stacktrace);
            }
        }
        if (this._error) {
            const errorElement = testCaseElement.ele('error', this._errorAttributes);
            if (this._errorContent) {
                errorElement.cdata(this._errorContent);
            }
        }
        if (this._skipped) {
            testCaseElement.ele('skipped');
        }
        if (this._standardOutput) {
            testCaseElement.ele('system-out').cdata(this._standardOutput);
        }
        let systemError;
        if (this._standardError) {
            systemError = testCaseElement.ele('system-err').cdata(this._standardError);

            if (this._errorAttachment) {
                systemError.txt(`[[ATTACHMENT|${this._errorAttachment}]]`);
            }
        }
    }
}
