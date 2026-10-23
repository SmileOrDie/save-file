#!/usr/bin/env bash
set -u
echo "===== HOST ====="
hostname
date -Is 2>/dev/null || date
echo
echo "===== BLOCK DEVICES (read-only) ====="
lsblk -o NAME,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINTS 2>&1 || true
echo
echo "===== FILESYSTEM USAGE ====="
df -hT 2>&1 || true
echo
echo "===== MOUNT TABLE ====="
findmnt 2>&1 || true
echo
echo "===== NETWORK LISTENERS: FTP/SFTP COMMON PORTS ====="
if command -v ss >/dev/null 2>&1; then
  sudo -n ss -lntp 2>&1 | grep -E ':(21|22|990|2022)\\b' || true
else
  echo "ss command unavailable"
fi
echo
echo "===== RELATED SERVICES ====="
if command -v systemctl >/dev/null 2>&1; then
  systemctl list-units --type=service --all --no-pager 2>/dev/null |
    grep -Ei 'ssh|sftp|ftp|vsftpd|proftpd|pure-ftpd' || true
fi
echo
echo "===== FTP SERVER CONFIG FILE PRESENCE (names only) ====="
for f in /etc/ssh/sshd_config /etc/vsftpd.conf /etc/proftpd/proftpd.conf; do
  if [ -r "$f" ]; then echo "present: $f"; fi
done
echo
echo "===== END: no changes were made ====="
