import { TestBed } from '@angular/core/testing';
import { CanvasToBMP } from './canvas-to-bmp';

describe('ExportDialogService', () => {
    let service: CanvasToBMP;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [CanvasToBMP],
        });
        TestBed.compileComponents();
        service = TestBed.get(CanvasToBMP);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call setU16 3 times when toArrayBuffer is called', () => {
        const newElement = document.createElement('canvas');
        const spy = spyOn<any>(service, 'setU16');
        service.toArrayBuffer(newElement);
        expect(spy).toHaveBeenCalledTimes(3);
    });

    it('should call setU32 14 times when toArrayBuffer is called', () => {
        const newElement = document.createElement('canvas');
        const spy = spyOn<any>(service, 'setU32');
        service.toArrayBuffer(newElement);
        expect(spy).toHaveBeenCalledTimes(14);
    });

    it('should a type equal image / bmp when toBlob is called', () => {
        const newElement = document.createElement('canvas');
        const result = service.toBlob(newElement);
        expect(result.type).toEqual('image/bmp');
    });

    it('result should contain data: image / bmp; base64, when toDataURL is called', () => {
        const newElement = document.createElement('canvas');
        const result = service.toDataURL(newElement);
        expect(result).toContain('data:image/bmp;base64,');
    });
});
