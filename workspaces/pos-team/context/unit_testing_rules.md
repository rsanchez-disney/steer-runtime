all the classes for test should be:
1. have a before with function called setup and after with function called tearDown
2. all the parameters on the constructor and function inside should be mocked
3. mockk library should be used for new tests
4. if need to use something like RxJavaPlugins.setIoSchedulerHandler { Schedulers.trampoline() } need to reset on the after
5. the name should be like ```fun `given <pre-conditions> when <the action test> then <result for the test>`()```
6. on the After should called clearAllMocks() and unmockkAll() MANDATORY if the test need to use mockk, in case than the test do not use mockk, please do not add @after
7. setup should use MockKAnnotations.init(this) when the test class use mockk
8. on the setup need to be initialize the class to test with the constructor without InjectMockk function
9. all tests should be create on java folder but with a kotlin class
10. if there is any test class to tests that class, please use it to add more tests
11. the imports should not contains *, the class should import specific classes, constants, etc.
12. if you use mockkStatic or mockkObject, clean them up appropriately: use unmockkStatic/unmockkObject for test-specific mocks, or unmockkAll for shared/general mocks in @AfterEach
13. all classes than are to inject to function should be mocked as well as constructor
14. all native like string, int, long, boolean, should be created on constant variable in the top on the class, and just create constant when those need to be used in more than one place.
    example
    Top-level private const for primitives/strings
    private const val TEST_ID = 1234
    private const val API_PATH = "/users"
    class ClassTest {

15. please use annotation @RelaxedMockk or @Mockk to mock classes
16. to mockk, please review the documentation on https://mockk.io/
17. if it is necessary to use `mockkConstructor` or mock private members, please do so following MockK documentation
18. do not use assert(result==expected), please use assertEquals(expected, result)
