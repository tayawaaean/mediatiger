# Channel Validation System

## Overview

The channel validation system prevents duplicate YouTube channel submissions and ensures data integrity across the MediaTiger application. It includes both frontend validation and database-level constraints.

## Features

### 1. **Duplicate Prevention**
- Prevents the same YouTube channel from being submitted multiple times
- Checks for existing channels across all users and statuses
- Allows resubmission of rejected channels
- Prevents cross-user channel conflicts

### 2. **Multi-Level Validation**
- **Frontend Validation**: Immediate feedback during form submission
- **Database Constraints**: Unique constraints and triggers prevent duplicates
- **Utility Functions**: Reusable validation logic across components

### 3. **Status-Aware Validation**
- **Pending**: Cannot submit if already pending review
- **Approved**: Cannot submit if already approved
- **Rejected**: Allows resubmission for improvement
- **Different User**: Prevents channel conflicts between users

## Implementation

### Database Constraints

```sql
-- Global uniqueness on channel URLs
ALTER TABLE channels 
ADD CONSTRAINT channels_link_unique UNIQUE (link);

-- User-specific uniqueness
ALTER TABLE channels 
ADD CONSTRAINT channels_user_link_unique UNIQUE (user_id, link);

-- Performance indexes
CREATE INDEX idx_channels_link ON channels(link);
CREATE INDEX idx_channels_user_id ON channels(user_id);
CREATE INDEX idx_channels_status ON channels(status);
```

### Database Triggers

```sql
-- Prevents duplicate submissions with clear error messages
CREATE TRIGGER check_channel_duplicates_trigger
  BEFORE INSERT ON channels
  FOR EACH ROW
  EXECUTE FUNCTION check_channel_duplicates();
```

### Frontend Validation

```typescript
// Validate channel submission
const validationResult = await validateChannelSubmission(
  channelUrl,
  userId,
  type
);

if (!validationResult.isValid) {
  const errorMessage = getChannelValidationErrorMessage(
    validationResult.error!, 
    translate
  );
  toast.error(errorMessage);
  return;
}
```

## Validation Rules

### 1. **URL Format Validation**
- Must be valid YouTube channel URL
- Format: `https://youtube.com/@channelname`
- Supports www and non-www variants

### 2. **Duplicate Detection**
- **Same User**: Prevents duplicate submissions
- **Different User**: Prevents cross-user conflicts
- **Status Check**: Considers current channel status

### 3. **Resubmission Rules**
- **Pending**: ❌ Cannot resubmit
- **Approved**: ❌ Cannot resubmit
- **Rejected**: ✅ Can resubmit (for improvement)

## Error Messages

| Error Code | Message | Action |
|------------|---------|---------|
| `INVALID_URL` | "Please enter a valid YouTube channel URL" | Fix URL format |
| `ALREADY_PENDING` | "This channel is already pending review" | Wait for approval |
| `ALREADY_APPROVED` | "This channel is already approved" | Channel already active |
| `ALREADY_REGISTERED_BY_OTHER_USER` | "Channel is already registered by another user" | Choose different channel |
| `CHECK_ERROR` | "Error checking channel status" | Try again later |
| `VALIDATION_ERROR` | "Error validating channel" | Contact support |

## Usage Examples

### Basic Validation

```typescript
import { validateChannelSubmission } from '../utils/channelValidation';

const result = await validateChannelSubmission(
  'https://youtube.com/@example',
  'user-123',
  'channel'
);

if (result.isValid) {
  // Proceed with submission
} else {
  // Handle validation error
  console.log(result.error);
}
```

### Error Handling

```typescript
import { getChannelValidationErrorMessage } from '../utils/channelValidation';

const errorMessage = getChannelValidationErrorMessage(
  validationResult.error!,
  translate
);
toast.error(errorMessage);
```

### Resubmission Check

```typescript
import { canResubmitChannel } from '../utils/channelValidation';

const canResubmit = await canResubmitChannel(
  'https://youtube.com/@example',
  'user-123'
);

if (canResubmit) {
  // Show resubmission form
} else {
  // Show new submission form
}
```

## Database Schema

### Channels Table

```sql
CREATE TABLE channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  link text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  main_request_id uuid REFERENCES user_requests(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT channels_link_unique UNIQUE (link),
  CONSTRAINT channels_user_link_unique UNIQUE (user_id, link),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected'))
);
```

### User Requests Table

```sql
CREATE TABLE user_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  youtube_links text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending',
  -- ... other fields
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected'))
);
```

## Performance Considerations

### Indexes
- `idx_channels_link`: Fast lookups by channel URL
- `idx_channels_user_id`: Fast user-specific queries
- `idx_channels_status`: Fast status-based filtering
- `idx_channels_user_status`: Fast user + status queries

### Query Optimization
- Single query for validation instead of multiple
- Efficient error code handling
- Minimal database round trips

## Testing

### Unit Tests

```typescript
describe('Channel Validation', () => {
  it('should prevent duplicate submissions', async () => {
    // Test duplicate prevention
  });
  
  it('should allow resubmission of rejected channels', async () => {
    // Test resubmission logic
  });
  
  it('should prevent cross-user conflicts', async () => {
    // Test user isolation
  });
});
```

### Integration Tests

```typescript
describe('Channel Management Integration', () => {
  it('should validate channels before submission', async () => {
    // Test full submission flow
  });
  
  it('should handle database constraints', async () => {
    // Test database-level validation
  });
});
```

## Migration Guide

### 1. **Run Database Migration**
```bash
# Apply the channel uniqueness migration
supabase db push
```

### 2. **Update Components**
```typescript
// Replace manual validation with utility function
import { validateChannelSubmission } from '../utils/channelValidation';

// Use in handleSubmit and verifyChannel functions
```

### 3. **Test Validation**
- Test duplicate submission prevention
- Test resubmission of rejected channels
- Test cross-user channel conflicts
- Test error message localization

## Troubleshooting

### Common Issues

1. **Constraint Violation Errors**
   - Check if channel already exists
   - Verify user permissions
   - Check database constraints

2. **Validation Failures**
   - Verify URL format
   - Check channel status
   - Ensure proper user context

3. **Performance Issues**
   - Verify indexes are created
   - Check query execution plans
   - Monitor database performance

### Debug Mode

```typescript
// Enable debug logging
const validationResult = await validateChannelSubmission(
  channelUrl,
  userId,
  type
);

console.log('Validation result:', validationResult);
```

## Future Enhancements

### 1. **Rate Limiting**
- Prevent rapid-fire submissions
- Implement cooldown periods
- Add submission quotas

### 2. **Advanced Validation**
- YouTube API integration
- Channel existence verification
- Content policy compliance

### 3. **Analytics**
- Track validation failures
- Monitor duplicate attempts
- User behavior analysis

## Support

For issues or questions about the channel validation system:

1. Check the error logs
2. Verify database constraints
3. Test with the validation utility
4. Review this documentation
5. Contact the development team
