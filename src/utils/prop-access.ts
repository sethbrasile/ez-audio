// // Example usage:

// interface ExampleType {
//   a: {
//     b: {
//       c: number
//       d: string
//     }
//     e: boolean
//   }
//   f: string
// }

// const exampleObj: ExampleType = {
//   a: {
//     b: {
//       c: 42,
//       d: 'hello',
//     },
//     e: true,
//   },
//   f: 'world',
// }

// // Valid access
// const value1 = get(exampleObj, 'a.b.c') // Type inferred as number
// const value2 = get(exampleObj, 'a.e') // Type inferred as boolean
// const value3 = get(exampleObj, 'f') // Type inferred as string

// // Invalid access
// const value4 = get(exampleObj, 'a.b.x') // TypeScript error: 'x' does not exist in type 'b'.

// // Valid set
// set(exampleObj, 'a.b.c', 100);   // Sets a.b.c to 100
// set(exampleObj, 'a.e', false);   // Sets a.e to false
// set(exampleObj, 'f', 'new world'); // Sets f to 'new world'

// // Invalid set
// set(exampleObj, 'a.b.c', 'wrong'); // TypeScript error: Type 'string' is not assignable to type 'number'.
// set(exampleObj, 'a.b.x', 100);     // TypeScript error: Property 'x' does not exist on type 'b'.

// type PathImpl<T, K extends keyof T> = K extends string
//   ? T[K] extends Record<string, any>
//     ? `${K}` | `${K}.${PathImpl<T[K], keyof T[K]>}`
//     : `${K}`
//   : never

// type Path<T> = PathImpl<T, keyof T>

// type PathValue<T, P extends Path<T>> =
//   P extends `${infer K}.${infer Rest}`
//     ? K extends keyof T
//       ? Rest extends Path<T[K]>
//         ? PathValue<T[K], Rest>
//         : never
//       : never
//     : P extends keyof T
//       ? T[P]
//       : never

// export function get<T, P extends Path<T>>(obj: T, path: P): PathValue<T, P> {
//   return path.split('.').reduce((acc: any, key: string) => acc && acc[key], obj) as PathValue<T, P>
// }

// export function set<T, P extends Path<T>, V extends PathValue<T, P>>(
//   obj: T,
//   path: P,
//   value: V,
// ): void {
//   const keys = path.split('.')
//   let acc: any = obj
//   for (let i = 0; i < keys.length - 1; i++) {
//     const key = keys[i]
//     if (!acc[key]) {
//       acc[key] = {}
//     }
//     acc = acc[key]
//   }
//   acc[keys[keys.length - 1]] = value
// }

export function get<T>(obj: any, path: string): T {
  return path.split('.').reduce((acc: any, key: string) => acc && acc[key], obj) as T
}

export function set<T>(
  obj: any,
  path: string,
  value: T,
): void {
  const keys = path.split('.')
  let acc: any = obj
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!acc[key]) {
      acc[key] = {}
    }
    acc = acc[key]
  }
  acc[keys[keys.length - 1]] = value
}
