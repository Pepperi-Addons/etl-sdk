import { SearchData } from "@pepperi-addons/papi-sdk"

export interface BuildOperations<T,K,L>
{
	searchObjectsByPage (page: number | string, pageSize: number, additionalFields?: string): Promise<SearchData<T>>,
	fixObjects (objects: T[]): K[],
	batchUpsert (resourceName: string, objects: K[]): Promise<L[]>
}

export interface PageKeyBuildOperations<T,K,L> extends BuildOperations<T,K,L>
{
	searchObjectsByPage (pageKey: string, pageSize: number, additionalFields?: string): Promise<SearchData<T>>,
	fixObjects (objects: T[]): K[],
	batchUpsert (resourceName: string, objects: K[]): Promise<L[]>
}

export interface PageNumberBuildOperations<T,K,L> extends BuildOperations<T,K,L>
{
	searchObjectsByPage (pageNumber: number, pageSize: number, additionalFields?: string): Promise<SearchData<T>>,
	fixObjects (objects: T[]): K[],
	batchUpsert (resourceName: string, objects: K[]): Promise<L[]>
}