import { Component, Input, Output, EventEmitter, OnChanges, ViewChild} from '@angular/core';
import { UserService } from '../../services';
import { DROPDOWN_DIRECTIVES } from 'ng2-bootstrap';


@Component({
    selector: 'transflo-upload-Carriers',
    template: require('./uploadCarriers.component.html'),
    styles: [`
    .showLoader { display:block; }
    .hideLoader { display:none; }
    `],
	providers: [UserService],
    directives: [DROPDOWN_DIRECTIVES]
})

export class uploadCarriersComponent {
    @Input() private brokers: any[] = [];
    @ViewChild('uploadFilesInput')  ufilesInput: any;
	@Output() onToggle = new EventEmitter();
    public carriersUpoadSampleUrl = this.UserService.getCarriersUpoadSampleUrl();
    public brokerCode: string;
    public uploadSucceeded = false;
    public uploadStatusMessage: string;
    public hideUploadStatus = true;
    private fileToUpload: File;
    public fileUploading: boolean = false;

    fileChange(event) {
        let fileList: FileList = event.target.files;
        if (fileList.length > 0) {
            this.fileToUpload = fileList[0];
        }
        
    }

    uploadFile() {
        this.fileUploading = true;
        this.UserService.carriersUpoad(this.brokerCode, this.fileToUpload).then((result) => {
                console.log(result);
                this.hideUploadStatus = false;
                this.uploadStatusMessage = result;//'Upload succeeded.';
                this.uploadSucceeded = true;
                this.fileUploading = false;
            }).catch((result) => {
                console.log(result);
                this.hideUploadStatus = false;
                this.uploadSucceeded = false;
                this.fileUploading = false;
                this.uploadStatusMessage = result;//'Upload failed.';
            });
    }

    ngOnChanges(changes) {
        this.setbrokerCode();
    };

    setbrokerCode() {
        if (this.brokers.length === 1) {
            this.brokerCode = this.brokers[0].code;
        }
    }
    uploadCarriersInit() {
        this.hideUploadStatus = true;
        this.brokerCode = '';
        this.ufilesInput.nativeElement.value = "";
        this.setbrokerCode();
    }

    cleanFile() {
        this.hideUploadStatus = true;
    }

    constructor(private UserService: UserService) { }
}