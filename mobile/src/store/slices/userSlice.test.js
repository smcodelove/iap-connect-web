import userReducer, {
  updateFollowStatus,
  clearUserData,
} from './userSlice';

describe('userSlice reducer', () => {
  const initialState = {
    followingUsers: [],
    followLoading: [],
    profiles: {},
    searchResults: {
      users: [],
      total: 0,
      page: 1,
      per_page: 20,
      has_next: false,
      has_prev: false,
      loading: false,
      error: null,
      query: '',
    },
    profileLoading: {},
    errors: {},
    currentProfile: null,
    currentProfileLoading: false,
    userFollowers: {},
    userFollowing: {},
    suggestedUsers: [],
    suggestedUsersLoading: false,
  };

  it('should handle initial state', () => {
    expect(userReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle updateFollowStatus to add userId', () => {
    const userId = 1;
    const action = updateFollowStatus({ userId, isFollowing: true });
    const state = userReducer(initialState, action);
    expect(state.followingUsers).toContain(userId);
  });

  it('should handle updateFollowStatus to remove userId', () => {
    const userId = 1;
    const preState = {
      ...initialState,
      followingUsers: [userId],
    };
    const action = updateFollowStatus({ userId, isFollowing: false });
    const state = userReducer(preState, action);
    expect(state.followingUsers).not.toContain(userId);
  });

  it('should clear user data', () => {
    const preState = {
      ...initialState,
      followingUsers: [1, 2, 3],
      currentProfile: { id: 1 },
    };
    const action = clearUserData();
    const state = userReducer(preState, action);
    expect(state).toEqual(initialState);
  });
});
