pragma solidity ^0.4.18;

contract Project {

  enum State {
    Created,
    Active,
    Approved,
    Cancelled
  }

  enum Role {
    Stranger,
    Contractor,
    Client
  }

  string public name;
  State public state = State.Created;

  uint16 public constant version = 1;

  uint32 public lastActivityDate;
  uint32 public executionDate;
  uint32 public endDate;

  address public clientAddress;
  address public contractorAddress;

  uint32 public prepayFractionThousands;
  uint32 public timeCapMinutes;

  uint32 public minutesReported;
  string public contractorComment;

  uint256 public hourlyRate;

  uint256 private contractorCredit = 0;
  uint256 private contractorDebit = 0;

  function Project(
    string _name,
    address _clientAddress,
    uint256 _hourlyRate,
    uint32 _timeCapMinutes,
    uint32 _prepayFractionThousands)
  public {
    require(_prepayFractionThousands <= 1000);
    require(_clientAddress != msg.sender);
    name = _name;
    clientAddress = _clientAddress;
    contractorAddress = msg.sender;
    hourlyRate = _hourlyRate;
    timeCapMinutes = _timeCapMinutes;
    prepayFractionThousands = _prepayFractionThousands;
    lastActivityDate = getTime();
  }

  modifier onlyContractor() {
    require(msg.sender == contractorAddress);
    _;
  }

  modifier onlyClient() {
    require(msg.sender == clientAddress);
    _;
  }

  modifier onlyParties() {
    require(msg.sender == contractorAddress || msg.sender == clientAddress);
    _;
  }

  modifier onlyAtState(State _state) {
    require(state == _state);
    _;
  }

  function start() onlyClient() onlyAtState(State.Created) external payable {
    require(this.balance >= (hourlyRate * timeCapMinutes) / 60);
    state = State.Active;
    contractorCredit = getPrepay();
    uint32 timestamp = getTime();
    executionDate = timestamp;
    lastActivityDate = timestamp;
  }

  function getRole() public view returns (Role) {
    if (msg.sender == clientAddress) {
      return Role.Client;
    }
    if (msg.sender == contractorAddress) {
      return Role.Contractor;
    }
    return Role.Stranger;
  }

  function getPrepay() public view returns (uint256) {
    uint256 priceCap = getPriceCap();
    return (priceCap * prepayFractionThousands) / 1000;
  }

  function getPriceCap() public view returns (uint256) {
    return (hourlyRate * timeCapMinutes) / 60;
  }

  function availableForWithdraw() public view returns (uint) {
    if (state == State.Created) {
      return 0;
    }

    Role role = getRole();

    if (role == Role.Stranger) {
      return 0;
    }

    assert(contractorCredit >= contractorDebit);
    uint256 availableToContractor = contractorCredit - contractorDebit;

    if (role == Role.Contractor) {
      return availableToContractor;
    }

    if (role == Role.Client) {
      if (state != State.Approved && state != State.Cancelled) {
        return 0;
      }
      assert(this.balance >= availableToContractor);
      return this.balance - availableToContractor;
    }

    assert(false);
  }

  function setBillableTime(uint32 timeMinutes, string comment)
    onlyContractor() onlyAtState(State.Active)
  external {
    uint32 timestamp = getTime();
    require(timeMinutes <= timeCapMinutes);
    require(timeMinutes * 60 <= timestamp - executionDate);
    minutesReported = timeMinutes;
    contractorComment = comment;
    lastActivityDate = timestamp;
  }

  function approve() onlyClient() onlyAtState(State.Active) external {
    state = State.Approved;
    uint32 timestamp = getTime();
    endDate = timestamp;
    lastActivityDate = timestamp;

    uint256 approvedPrice = (hourlyRate * minutesReported) / 60;
    if (approvedPrice > contractorCredit) {
      contractorCredit = approvedPrice;
    }
  }

  function cancel() onlyClient() onlyAtState(State.Active) external {
    state = State.Cancelled;
    uint32 timestamp = getTime();
    endDate = timestamp;
    lastActivityDate = timestamp;
  }

  function withdraw() onlyParties() public {
    lastActivityDate = getTime();
    uint256 toBeSent = availableForWithdraw();
    if (toBeSent > 0) {
      if (getRole() == Role.Contractor) {
        contractorDebit = contractorDebit + toBeSent;
      }
      msg.sender.transfer(toBeSent);
    }
  }

  function leaveFeedback(bool positive, string comment) onlyParties() external {
    require(state == State.Approved || state == State.Cancelled);
    // TODO
    lastActivityDate = getTime();
  }

  function getTime() internal view returns (uint32) {
    return uint32(now);
  }

}
