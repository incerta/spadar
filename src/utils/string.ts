export const toKebabCase = (str: string): string => {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2') // Convert camelCase
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2') // Convert PascalCase
    .replace(/[_\s]+/g, '-') // Convert snake_case
    .toLowerCase()
}

/* Just capitalize the first letter of the string */
export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/* PascalCase to kebab-case */
export const camelCaseToPascalCase = capitalizeFirstLetter
