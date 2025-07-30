#!/usr/bin/env tsx

/**
 * Migration Test Runner
 * 
 * Run this script to validate the API key migration system:
 * npm run test:migration
 */

import { runMigrationTests, validateMigrationReadiness, generateMigrationReport } from '../src/lib/testing/api-key-migration-test';

async function main() {
  console.log('🔄 API Key Migration Test Suite\n');
  console.log('===============================\n');

  // Step 1: Check migration readiness
  console.log('📋 Checking migration readiness...\n');
  
  const readinessCheck = await validateMigrationReadiness();
  
  console.log(`Ready: ${readinessCheck.ready ? '✅' : '❌'}\n`);
  
  if (readinessCheck.issues.length > 0) {
    console.log('❌ Issues found:');
    readinessCheck.issues.forEach(issue => console.log(`   - ${issue}`));
    console.log('');
  }
  
  if (readinessCheck.recommendations.length > 0) {
    console.log('💡 Recommendations:');
    readinessCheck.recommendations.forEach(rec => console.log(`   - ${rec}`));
    console.log('');
  }

  // Step 2: Run migration tests
  console.log('🧪 Running migration tests...\n');
  
  const testResults = await runMigrationTests();
  
  // Step 3: Generate report
  const report = generateMigrationReport(testResults);
  console.log(report);

  // Step 4: Exit with appropriate code
  const allPassed = testResults.every(result => result.passed);
  const readyForProduction = readinessCheck.ready && allPassed;
  
  if (readyForProduction) {
    console.log('🎉 Migration system is ready for production deployment!');
    process.exit(0);
  } else {
    console.log('⚠️  Please address the issues above before deploying to production.');
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

// Run the main function
main().catch((error) => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});