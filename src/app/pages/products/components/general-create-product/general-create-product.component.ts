import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UploadImageComponent } from '@app/shared/upload-image/upload-image.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ProductInterface } from '../../interfaces/product.interface';
import { productFormHelp } from '../../constants/form-product-helper.constant';
import { unitsOfMeasure } from '@app/common/constants/units.constan';
import { materials } from '@app/common/constants/materials.constant';
import { conditions } from '@app/common/constants/conditions.constant';
import { TagifyInputComponent } from '@app/shared/tagify-input/tagify-input.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { currencyOptionsConstant } from '../../constants/currency-option.constant';
import { PhysicalProductInterface } from '../../interfaces/product-physical.interface';
import { warranties } from '@app/common/constants/warranties.constant';
import { NgxCurrencyDirective } from 'ngx-currency';
import { countries } from '@app/common/constants/countries.constant';
import Quill from 'quill';
import { CategoryInterface } from '@app/pages/categories/interfaces/category.interface';
import { ValidationPopoverComponent } from '@app/shared/validation-popover/validation-popover.component';
import { ɵɵDir } from "@angular/cdk/scrolling";
import { catchError, finalize, tap } from 'rxjs';
import { CharacteristicInterface } from '../../interfaces/characteristic.interface';
import { createEmptyCharacteristic } from '../../utils/empties.util';
import { TextareaAutoresizeDirective } from '@app/common/directives/textarea-autoresize.directive';


@Component({
  selector: 'app-general-create-product',
  imports: [
    CommonModule,
    NgSelectModule,
    FormsModule,
    TagifyInputComponent,
    NgbTooltipModule,
    NgxCurrencyDirective,
    ValidationPopoverComponent,
    TextareaAutoresizeDirective
],
  templateUrl: './general-create-product.component.html',
  styleUrl: './general-create-product.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GeneralCreateProductComponent {
    @Input({ required: true }) product!: ProductInterface;
    @Input({ required: true}) physical!: PhysicalProductInterface;
    @Input({ required: true}) errorsProduct! : any;
    @Input({ required: false}) loadProduct : boolean = true;
    @Input() categorySelected : CategoryInterface | undefined;
    @Input() whiteListTags : any[] = [];
    @Input() showErrors: any = {};
    @Input() id : string = '';
    public labelHelper = productFormHelp;
    public units_ = unitsOfMeasure;
    public materials_ = materials;
    public conditions_ = conditions;
    public currencyOptions = currencyOptionsConstant;
    public warranties_ = warranties;
    public countries = countries;
    private quill!: Quill;
    @ViewChild('editor') editorRef!: ElementRef;
    public characteristics: CharacteristicInterface[] = [createEmptyCharacteristic()];

    constructor(){
    }


    ngOnChanges(changes: SimpleChanges): void {
        if (changes['product']) {
            this.setEditorContent();
        }
    }

    ngAfterViewInit(): void {
        this.initEditor(this.editorRef);
    }

    private initEditor(editor: ElementRef): void {
        this.quill = new Quill(editor.nativeElement, {
            theme: 'snow'
        });

        this.setEditorContent();

        this.quill.on('text-change', () => {
            this.product.description = this.quill.root.innerHTML;
        });
    }

    private setEditorContent(): void {
        if (!this.quill || !this.product) {
            return;
        }

        const html = this.product.description ?? '';

        if (this.quill.root.innerHTML !== html) {
            const selection = this.quill.getSelection();
            this.quill.clipboard.dangerouslyPasteHTML(html);

            if (selection) {
                this.quill.setSelection(selection);
            }
        }
    }

    onTagsChange = (tags: string[]) => this.product.tags = tags;
}
