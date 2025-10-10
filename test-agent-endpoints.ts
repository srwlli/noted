/**
 * Test script for Agent Communication Edge Functions
 * Tests all 4 endpoints: generate-token, read-note, update-note, revoke-token
 *
 * Usage:
 * 1. Set USER_JWT and NOTE_ID environment variables
 * 2. Run: deno run --allow-net --allow-env test-agent-endpoints.ts
 */

const SUPABASE_URL = 'https://ikovzegiuzjkubymwvjz.supabase.co';
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

interface TestResult {
  test: string;
  passed: boolean;
  status?: number;
  error?: string;
  data?: any;
}

const results: TestResult[] = [];

function logTest(result: TestResult) {
  results.push(result);
  const icon = result.passed ? '✅' : '❌';
  console.log(`${icon} ${result.test}`);
  if (result.status) console.log(`   Status: ${result.status}`);
  if (result.error) console.log(`   Error: ${result.error}`);
  if (result.data) console.log(`   Data:`, JSON.stringify(result.data, null, 2));
  console.log('');
}

async function testGenerateToken(userJwt: string): Promise<{ token: string; tokenId: string } | null> {
  console.log('🧪 TEST 1: Generate Agent Token');
  console.log('=====================================\n');

  try {
    const response = await fetch(`${FUNCTIONS_URL}/agent-generate-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userJwt}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: 'Test Token - Automated Testing' })
    });

    const data = await response.json();

    if (response.ok && data.token && data.token_id) {
      logTest({
        test: 'Generate agent token',
        passed: true,
        status: response.status,
        data: {
          token_prefix: data.token_prefix,
          token_id: data.token_id,
          expires_at: data.expires_at,
          warning: data.warning
        }
      });
      return { token: data.token, tokenId: data.token_id };
    } else {
      logTest({
        test: 'Generate agent token',
        passed: false,
        status: response.status,
        error: data.error || 'Unknown error'
      });
      return null;
    }
  } catch (error) {
    logTest({
      test: 'Generate agent token',
      passed: false,
      error: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}

async function testReadNote(agentToken: string, noteId: string) {
  console.log('🧪 TEST 2: Read Note');
  console.log('=====================================\n');

  try {
    const response = await fetch(`${FUNCTIONS_URL}/agent-read-note?note_id=${noteId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${agentToken}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      logTest({
        test: 'Read note with agent token',
        passed: true,
        status: response.status,
        data: {
          note_id: data.note_id,
          title: data.title,
          content_length: data.content?.length || 0
        }
      });
      return data;
    } else {
      logTest({
        test: 'Read note with agent token',
        passed: false,
        status: response.status,
        error: data.error
      });
      return null;
    }
  } catch (error) {
    logTest({
      test: 'Read note with agent token',
      passed: false,
      error: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}

async function testUpdateNoteReplace(agentToken: string, noteId: string, note: any) {
  console.log('🧪 TEST 3: Update Note (Replace Mode)');
  console.log('=====================================\n');

  const testContent = `# Agent Test - Replace Mode\n\nThis content was written by the agent test script at ${new Date().toISOString()}.\n\n## Original Content Length\n${note.content?.length || 0} characters\n\n## Test Details\n- Mode: Replace\n- Timestamp: ${Date.now()}`;

  try {
    const response = await fetch(`${FUNCTIONS_URL}/agent-update-note`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${agentToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        note_id: noteId,
        content: testContent,
        append: false
      })
    });

    const data = await response.json();

    if (response.ok) {
      logTest({
        test: 'Update note (replace mode)',
        passed: true,
        status: response.status,
        data: {
          note_id: data.note_id,
          updated_at: data.updated_at,
          content_hash: data.content_hash
        }
      });
      return data;
    } else {
      logTest({
        test: 'Update note (replace mode)',
        passed: false,
        status: response.status,
        error: data.error
      });
      return null;
    }
  } catch (error) {
    logTest({
      test: 'Update note (replace mode)',
      passed: false,
      error: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}

async function testUpdateNoteAppend(agentToken: string, noteId: string) {
  console.log('🧪 TEST 4: Update Note (Append Mode with Optimistic Locking)');
  console.log('=====================================\n');

  // First, read the note to get current version
  const readResponse = await fetch(`${FUNCTIONS_URL}/agent-read-note?note_id=${noteId}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${agentToken}` }
  });
  const currentNote = await readResponse.json();

  if (!currentNote.updated_at) {
    logTest({
      test: 'Update note (append mode)',
      passed: false,
      error: 'Could not get current note version'
    });
    return null;
  }

  const appendContent = `\n\n---\n\n## Appended by Agent\n\nTimestamp: ${new Date().toISOString()}\nTest: Append mode with optimistic locking`;

  try {
    const response = await fetch(`${FUNCTIONS_URL}/agent-update-note`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${agentToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        note_id: noteId,
        content: appendContent,
        append: true,
        expected_version: currentNote.updated_at
      })
    });

    const data = await response.json();

    if (response.ok) {
      logTest({
        test: 'Update note (append mode)',
        passed: true,
        status: response.status,
        data: {
          note_id: data.note_id,
          updated_at: data.updated_at,
          content_hash: data.content_hash
        }
      });
      return data;
    } else {
      logTest({
        test: 'Update note (append mode)',
        passed: false,
        status: response.status,
        error: data.error
      });
      return null;
    }
  } catch (error) {
    logTest({
      test: 'Update note (append mode)',
      passed: false,
      error: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}

async function testInvalidToken(noteId: string) {
  console.log('🧪 TEST 5: Invalid Token (Security Test)');
  console.log('=====================================\n');

  const invalidToken = 'agent_fakefakefake_thisisnotarealtokenitshouldfail';

  try {
    const response = await fetch(`${FUNCTIONS_URL}/agent-read-note?note_id=${noteId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${invalidToken}`
      }
    });

    const data = await response.json();

    if (response.status === 401) {
      logTest({
        test: 'Reject invalid token',
        passed: true,
        status: response.status,
        data: { code: data.code }
      });
    } else {
      logTest({
        test: 'Reject invalid token',
        passed: false,
        status: response.status,
        error: 'Expected 401 Unauthorized'
      });
    }
  } catch (error) {
    logTest({
      test: 'Reject invalid token',
      passed: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

async function testContentTooLarge(agentToken: string, noteId: string) {
  console.log('🧪 TEST 6: Content Too Large (>10 KiB)');
  console.log('=====================================\n');

  // Create content larger than 10,240 bytes
  const largeContent = 'A'.repeat(11000);

  try {
    const response = await fetch(`${FUNCTIONS_URL}/agent-update-note`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${agentToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        note_id: noteId,
        content: largeContent,
        append: false
      })
    });

    const data = await response.json();

    if (response.status === 413) {
      logTest({
        test: 'Reject content > 10 KiB',
        passed: true,
        status: response.status,
        data: { code: data.code, max_size_bytes: data.max_size_bytes }
      });
    } else {
      logTest({
        test: 'Reject content > 10 KiB',
        passed: false,
        status: response.status,
        error: 'Expected 413 Payload Too Large'
      });
    }
  } catch (error) {
    logTest({
      test: 'Reject content > 10 KiB',
      passed: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

async function testXSSPrevention(agentToken: string, noteId: string) {
  console.log('🧪 TEST 7: XSS Prevention');
  console.log('=====================================\n');

  const xssContent = 'Safe content <script>alert("XSS")</script> more content';

  try {
    const response = await fetch(`${FUNCTIONS_URL}/agent-update-note`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${agentToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        note_id: noteId,
        content: xssContent,
        append: false
      })
    });

    const data = await response.json();

    if (response.status === 413 && data.error?.includes('dangerous')) {
      logTest({
        test: 'Reject XSS content',
        passed: true,
        status: response.status,
        data: { blocked: true }
      });
    } else {
      logTest({
        test: 'Reject XSS content',
        passed: false,
        status: response.status,
        error: 'Expected rejection of dangerous content'
      });
    }
  } catch (error) {
    logTest({
      test: 'Reject XSS content',
      passed: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

async function testRevokeToken(userJwt: string, tokenId: string) {
  console.log('🧪 TEST 8: Revoke Token');
  console.log('=====================================\n');

  try {
    const response = await fetch(`${FUNCTIONS_URL}/agent-revoke-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userJwt}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token_id: tokenId })
    });

    const data = await response.json();

    if (response.ok) {
      logTest({
        test: 'Revoke token',
        passed: true,
        status: response.status,
        data: {
          message: data.message,
          revoked_at: data.revoked_at
        }
      });
      return true;
    } else {
      logTest({
        test: 'Revoke token',
        passed: false,
        status: response.status,
        error: data.error
      });
      return false;
    }
  } catch (error) {
    logTest({
      test: 'Revoke token',
      passed: false,
      error: error instanceof Error ? error.message : String(error)
    });
    return false;
  }
}

async function testRevokedTokenRejection(revokedToken: string, noteId: string) {
  console.log('🧪 TEST 9: Reject Revoked Token');
  console.log('=====================================\n');

  try {
    const response = await fetch(`${FUNCTIONS_URL}/agent-read-note?note_id=${noteId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${revokedToken}`
      }
    });

    const data = await response.json();

    if (response.status === 401) {
      logTest({
        test: 'Reject revoked token',
        passed: true,
        status: response.status,
        data: { code: data.code }
      });
    } else {
      logTest({
        test: 'Reject revoked token',
        passed: false,
        status: response.status,
        error: 'Expected 401 Unauthorized for revoked token'
      });
    }
  } catch (error) {
    logTest({
      test: 'Reject revoked token',
      passed: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// Main test runner
async function runTests() {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║     Agent Communication Endpoint Test Suite          ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  const USER_JWT = Deno.env.get('USER_JWT');
  const NOTE_ID = Deno.env.get('NOTE_ID');

  if (!USER_JWT || !NOTE_ID) {
    console.error('❌ ERROR: Missing required environment variables');
    console.error('   Please set USER_JWT and NOTE_ID\n');
    console.error('Example:');
    console.error('  export USER_JWT="your-jwt-token"');
    console.error('  export NOTE_ID="your-note-id"\n');
    Deno.exit(1);
  }

  console.log(`📋 Test Configuration`);
  console.log(`   Supabase URL: ${SUPABASE_URL}`);
  console.log(`   Note ID: ${NOTE_ID}`);
  console.log(`   User JWT: ${USER_JWT.substring(0, 20)}...\n`);

  // Test 1: Generate token
  const tokenData = await testGenerateToken(USER_JWT);
  if (!tokenData) {
    console.error('\n❌ Cannot continue tests without valid agent token');
    Deno.exit(1);
  }

  // Extract token and token_id from response
  const agentToken = tokenData.token;
  const tokenId = tokenData.tokenId;

  // Test 2: Read note
  const note = await testReadNote(agentToken, NOTE_ID);
  if (!note) {
    console.error('\n⚠️ Read test failed, some tests may not work');
  }

  // Test 3: Update note (replace)
  await testUpdateNoteReplace(agentToken, NOTE_ID, note || {});

  // Test 4: Update note (append with optimistic locking)
  await testUpdateNoteAppend(agentToken, NOTE_ID);

  // Test 5: Security - Invalid token
  await testInvalidToken(NOTE_ID);

  // Test 6: Content validation - Too large
  await testContentTooLarge(agentToken, NOTE_ID);

  // Test 7: XSS prevention
  await testXSSPrevention(agentToken, NOTE_ID);

  // Test 8: Revoke token
  const revoked = await testRevokeToken(USER_JWT, tokenId);

  // Test 9: Try using revoked token
  if (revoked) {
    await testRevokedTokenRejection(agentToken, NOTE_ID);
  }

  // Print summary
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║                    TEST SUMMARY                       ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.log('Failed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.test}: ${r.error}`);
    });
    console.log('');
  }

  Deno.exit(failed > 0 ? 1 : 0);
}

// Run tests
if (import.meta.main) {
  runTests();
}
