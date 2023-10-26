import { PageNumberBuildOperations } from "../entities";
import { BuildBody } from "../entities/build-body";
import { BuildService } from "./build";

export class PageNumberBuilder<T,K,L> extends BuildService<T,K,L> {
	
	constructor(tableName: string, buildOperations: PageNumberBuildOperations<T,K,L>) 
	{
		super(tableName, buildOperations);
	}

	initializePagePointer(body: BuildBody): void {
		if(!body.currentPage)
		{
			body.currentPage = 1;
		}
	}
	setNextPagePointer(body: BuildBody, nextValue?: string): void {
		body.currentPage = (body.currentPage as number) + 1;
	}

	nextPageExists(resultPageSize: number, currentPage: number | string): boolean {
		return resultPageSize == this.pageSize;
	}
}