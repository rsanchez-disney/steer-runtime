### Mockk Objects

in specific works if the function use @JvmStatic does not matter if is and object class, this need
to be mocked as mockkStatic, and if is not companion object or object should be mockkStatic, the
other companion object or object should be mockkObject

next are the examples in case you need mockkObject or static

- to SharedPreferencesRepository
  mockkObject(SharedPreferencesRepository)
  every { SharedPreferencesRepository.getInstance() } returns mockk(relaxed = true) // or
  sharedPreferencesRepository as a mockk
- to RepositoryFactory
  every { RepositoryFactory.INSTANCE } returns mockk(relaxed = true)
- to RepositoryProvider
  mockkObject(RepositoryProvider)
  every { RepositoryProvider.instance } returns mockk(relaxed = true)
- AuditRepositoryManager
  mockkObject(AuditRepositoryManager)
- NetworkState
  mockkObject(NetworkState)

### Mockk Statics

- to Rx2SchedulerUtils
  mockkStatic(Rx2SchedulerUtils::class)
  every { Rx2SchedulerUtils.io(any()) } returns Schedulers.trampoline()
  every { Rx2SchedulerUtils.io(any(), any()) } returns Schedulers.trampoline()
  every { Rx2SchedulerUtils.single(any()) } returns Schedulers.trampoline()
- to UserManager
  mockkStatic(UserManager::class)
  every { UserManager.getInstance() } returns userManager // or mockk(relaxed = true)
- to Repo
  mockkStatic(Repo::class)
- to PaymentUtil
  mockkStatic(PaymentUtil::class)
- to DecimalUtil
  mockkStatic(DecimalUtil::class)
- to AppetizeApplication
  mockkStatic(AppetizeApplication::class)
  every { AppetizeApplication.getLoggedInUser() } returns mockk<User>(relaxed = true)
- to PaymentsRepositoryProvider
  mockkStatic(PaymentsRepositoryProvider::class)
  every { PaymentsRepositoryProvider.getRepository() } returns mockk(relaxed = true)

### Both Mockk Object and Static

- to AuditReporter
  mockkObject(AuditReporter)
  mockkStatic(AuditReporter::class)
