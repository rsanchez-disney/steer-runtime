# Skill: Guard and exception filter implementation

Use when adding auth, validation, or error handling.

## Guard checklist
1. Create `@Injectable()` class implementing `CanActivate`
2. Extract request from `ExecutionContext`
3. Validate headers/tokens/roles
4. Throw `BadRequestException` (400) or `UnauthorizedException` (401)
5. Register in module providers
6. Apply with `@UseGuards()` on controller or method
7. Add unit test

## Exception filter checklist
1. Create `@Catch()` class implementing `ExceptionFilter`
2. Handle: HttpException, upstream error arrays, plain objects, unknown
3. Normalize to `{ message }` JSON response
4. Apply with `@UseFilters()` on controller
5. Add unit test for each error shape
