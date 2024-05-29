export interface IPreSignedUrlService {
    getPreSignedUrl(folder: any, fileName: any): Promise<any>;
}