export enum LifiErrorCode {
    InternalError = 1000,
    ValidationError = 1001,
    TransactionUnderpriced = 1002,
    TransactionFailed = 1003,
    Timeout = 1004,
    ProviderUnavailable = 1005,
    NotFound = 1006,
    ChainSwitchError = 1007,
    TransactionUnprepared = 1008,
    GasLimitError = 1009,
    TransactionCanceled = 1010,
    SlippageError = 1011,
    TransactionRejected = 1012,
    BalanceError = 1013,
    AllowanceRequired = 1014,
    InsufficientFunds = 1015,
    TransactionDeclined = 4001
  }