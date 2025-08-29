// Query Filter Interface for advanced filtering
/* Example
    {
        field: 'name',
        operator: '=',
        value: 'John Doe'
    }
*/
export interface IQueryFilter<T> {
	field: keyof T;
	operator: '=' | '>' | '>=' | '<' | '<=' | 'IN' | 'LIKE';
	value: unknown;
}

/* Example
    {
        AND: [
            {
                field: 'name',
                operator: '=',
                value: 'John Doe'
            }
        ]
    }
*/
export interface ILogicalFilter<T> {
	AND?: Array<IQueryFilter<T> | ILogicalFilter<T>>;
	OR?: Array<IQueryFilter<T> | ILogicalFilter<T>>;
}
/* Example
    {
        select: ['name', 'email']
    }
*/

export interface IFieldSelection<T> {
	select?: Array<keyof T>; // List of fields to select
}

/* Example
    {
        field: 'name',
        order: 'asc'
    }
*/

export interface ISortOption<T> {
	field: keyof T;
	order: 'asc' | 'desc';
}

/* Example
    {
        limit: 10,
        offset: 0,

    }
*/
export interface IPaginationOption {
	limit: number;
	offset?: number; // Traditional offset-based pagination
	cursor?: string; // For cursor-based pagination (e.g., based on `createdAt` or `id`)
}

/* Example
    {
        filter: {
            AND: [
                {
                    field: 'name',
                    operator: '=',
                    value: 'John Doe'
                }
            ]
        },
        pagination: {
            limit: 10,
            offset: 0
        },
        sort: [
            {
                field: 'name',
                order: 'asc'
            }
        ],
        select: ['name', 'email']
    }
*/

export interface IGetAllOptions<T> {
	filter?: ILogicalFilter<T>; // Advanced filtering with AND/OR conditions
	pagination?: IPaginationOption; // Enhanced pagination
	sort?: Array<ISortOption<T>>; // Sorting by multiple fields
	select?: Array<keyof T>; // Field selection
}

export type TSelectOption<T> = 'id' | 'all' | Array<keyof T>;

// type ReturnCreate<T> = { id: string } | Partial<T> | T | void;
// type ReturnGet<T> = T | Partial<T>;
// type ReturnUpdate<T> = boolean | Partial<T> | T | void;

// export abstract class IGenericRepository<T, C = Partial<T>, K = string> {
// 	// Fetch all entities with filtering, pagination, sorting, and field selection
// 	abstract getAll(options?: IGetAllOptions<T>): Promise<T[]>;

// 	// Fetch a single entity by ID or with an optional filter
// 	abstract get(
// 		{ id, filter }: { id?: K; filter?: Partial<T> },
// 		select?: Array<keyof T>,
// 	): Promise<ReturnGet<T>>;

// 	// Create a new entity, which could be of type T or C
// 	abstract create(item: C): Promise<ReturnCreate<T>>;

// 	// Update an entity by ID, with partial updates allowed
// 	abstract update(id: K, item: Partial<T>): Promise<ReturnUpdate<T>>;

// 	// Soft delete an entity by ID (K could be string, number, etc.)
// 	abstract delete(id: K): Promise<void>;
// }
