import { PageKeyBuildOperations } from "../entities";
import { BuildBody } from "../entities/build-body";
import { BuildService } from "./build";

export class PageKeyBuilder<T,K,L> extends BuildService<T,K,L> {
	
	constructor(tableName: string, buildOperations: PageKeyBuildOperations<T,K,L>) 
	{
		super(tableName, buildOperations);
	}

	initializePagePointer(body: BuildBody): void {
		body.currentPage = "";
	}
	setNextPagePointer(body: BuildBody, nextValue?: string): void {
		body.currentPage = nextValue ?? "";
	}

	nextPageExists(resultPageSize: number, currentPage: number | string): boolean {
		return Boolean(currentPage);
	}
}