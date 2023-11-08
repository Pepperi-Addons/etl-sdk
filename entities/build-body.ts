export interface BuildBody {
	currentPage: number | string;
	[key: string]: any;
}

export interface BuildRequest {
	body: BuildBody;
	[key: string]: any;
}