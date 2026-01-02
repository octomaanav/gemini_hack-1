import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function testLiblouis() {
  const text = "x = (-b ± sqrt(b^2 - 4*a*c)) / (2*a)";
  const table = '/opt/homebrew/share/liblouis/tables/unicode.dis,/opt/homebrew/share/liblouis/tables/en-us-mathtext.ctb';

  try {
    const { stdout } = await execPromise(`echo '${text}' | lou_translate ${table}`);
    console.log('Input:', text);
    console.log('Braille:', stdout.trim());
  } catch (error) {
    console.error('Error:', error);
  }
}

testLiblouis();
