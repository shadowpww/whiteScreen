import crypto from 'crypto';

export function md5(str: string | Buffer) {
  const md5sum = crypto.createHash('md5');
  md5sum.update(str);
  return md5sum.digest('hex');
}
