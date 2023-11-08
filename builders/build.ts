import { performance } from "perf_hooks";
import { BuildOperations } from "../entities";
import { BuildBody, BuildRequest } from "../entities/build-body";

export abstract class BuildService<T,K,L>
{
	protected readonly pageSize = 500;

	constructor(
		private tableName: string,
		private buildOperations: BuildOperations<T,K,L>
	) {}

	abstract initializePagePointer(body: BuildBody): void;
	abstract setNextPagePointer(body: BuildBody, nextValue?: string): void;
	abstract nextPageExists(resultPageSize: number, currentPage: number | string): boolean;

	// request is sent by refernce, so we can update "currentPage" parameter
	public async buildTable(request: BuildRequest): Promise<any>
	{
    	const res: any = { success: true, timeoutReached: false };
		request.body = request.body ?? {}; // in case no request.body sent
    	try
    	{
			const startTime = performance.now();
    		let pageOfObjects: T[];
			this.initializePagePointer(request.body);
			console.log(`CURRENT PAGE AFTER INITIALIZE: ${request.body.currentPage}`);

    		do
    		{
    			const searchResult = await this.buildOperations.searchObjectsByPage(request.body.currentPage, this.pageSize);
				pageOfObjects = searchResult.Objects;
    			console.log(`FINISHED GETTING OBJECTS. RESULTS LENGTH: ${pageOfObjects.length}`);

				// fix results
    			const fixedObjects = this.buildOperations.fixObjects(pageOfObjects);
    			console.log(`FINISHED FIXING OBJECTS. RESULTS LENGTH: ${fixedObjects.length}`);
				
				await this.upsertByChunks(fixedObjects);

    			this.setNextPagePointer(request.body, searchResult.NextPageKey) // update currentPage parameter
    			console.log(`${this.tableName} PAGE UPSERT FINISHED.`);

				if (this.timeIsUp(startTime))
				{
					res.timeoutReached = true;
					res.success = false;
					console.log(`BUILDTABLE TIMEOUT. CURRENT PAGE: ${request.body.currentPage}`);
				}

    		} while (res.timeoutReached == false && this.nextPageExists(pageOfObjects.length, request.body.currentPage));

    	}
    	catch (error)
    	{
    		res.success = false;
    		res['errorMessage'] = error instanceof Error ? error.message : 'An unknown error occurred';
    	}
    	return res;
	}

	/**
	 * Uses batch upsert to upload the objects to given table.
	 * @param fixedObjects the objects to upload to given table
	 */
	protected async upsertByChunks(fixedObjects: any[])
	{
		// Since the fixedObjects array might be larger than the maximum of 500,
		// first split the fixedObjects into array of maximal size
		const fixedObjectsChunks = this.splitArrayIntoChunks(fixedObjects, this.pageSize);

		// Batch upsert
		for (const fixedObjectsChunk of fixedObjectsChunks)
		{
			await this.buildOperations.batchUpsert(this.tableName, fixedObjectsChunk);
			console.log(`CHUNK UPSERTED TO ${this.tableName} TABLE`);
		}
	}

	/**
	 * Splits an array of objects into smaller arrays of a maximum size.
	 * @param arr The array of objects to split.
	 * @param maxSize The maximum size of each resulting array.
	 * @returns An array of arrays of objects, where each inner array has a maximum size of maxSize.
	 */
	protected splitArrayIntoChunks(arr: any[], maxSize: number): any[][]
	{
		const chunks: any[][] = [];
		let currentChunk: any[] = [];

		for (const item of arr)
		{
			currentChunk.push(item);
			if (currentChunk.length === maxSize)
			{
				chunks.push(currentChunk);
				currentChunk = [];
			}
		}

		if (currentChunk.length > 0)
		{
			chunks.push(currentChunk);
		}

		return chunks;
	}

	// calculates if more than 9 minutes passed
	timeIsUp(startTime: number) {
		const minInMS = 60 * 1000;
		const tenMinInMS = minInMS * 10;
		return (tenMinInMS - (performance.now() - startTime)) <= minInMS;
	  }
}
