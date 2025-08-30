export interface IResume {
    cvId: number,
    cvTitle:string,
    cvImageUrl: string,
    cvDescription: string,
    cvUploadDate: string
}

export interface IResumeData {
    resumes: IResume[]
}