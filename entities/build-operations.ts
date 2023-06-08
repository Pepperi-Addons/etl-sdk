export interface BuildOperations<T,K,L>
{
	getObjectsByPage (page: number, pageSize: number, additionalFields?: string): Promise<T[]>,
	fixObjects (objects: T[]): K[],
	batchUpsert (resourceName: string, objects: K[]): Promise<L[]>
}