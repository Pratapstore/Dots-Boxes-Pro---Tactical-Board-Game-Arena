import os
import zipfile
import shutil

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DIST_DIR = os.path.join(ROOT_DIR, 'dist')
PUBLIC_DIR = os.path.join(ROOT_DIR, 'public')

os.makedirs(PUBLIC_DIR, exist_ok=True)

# 1. Package cpanel-ready-build.zip from dist/
cpanel_zip_path = os.path.join(PUBLIC_DIR, 'cpanel-ready-build.zip')
print(f"Packaging cPanel build zip into {cpanel_zip_path}...")
with zipfile.ZipFile(cpanel_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for foldername, subfolders, filenames in os.walk(DIST_DIR):
        for filename in filenames:
            if filename.endswith('.zip'):
                continue
            filepath = os.path.join(foldername, filename)
            arcname = os.path.relpath(filepath, DIST_DIR)
            zipf.write(filepath, arcname)
            print(f"  + {arcname}")

# Also create dist.zip alias
shutil.copyfile(cpanel_zip_path, os.path.join(PUBLIC_DIR, 'dist.zip'))
print("Copied cpanel-ready-build.zip -> dist.zip")

# 2. Package source zip: dots-and-boxes-pro-source.zip
source_zip_path = os.path.join(PUBLIC_DIR, 'dots-and-boxes-pro-source.zip')
print(f"Packaging source zip into {source_zip_path}...")
EXCLUDE_DIRS = {'node_modules', '.git', 'dist', '__pycache__', '.vite'}
EXCLUDE_EXTS = {'.zip', '.tar.gz', '.pyc'}

with zipfile.ZipFile(source_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for foldername, subfolders, filenames in os.walk(ROOT_DIR):
        # Filter subfolders in-place
        subfolders[:] = [d for d in subfolders if d not in EXCLUDE_DIRS]
        for filename in filenames:
            ext = os.path.splitext(filename)[1]
            if ext in EXCLUDE_EXTS or filename.endswith('.zip'):
                continue
            filepath = os.path.join(foldername, filename)
            relpath = os.path.relpath(filepath, ROOT_DIR)
            arcname = os.path.join('dots-and-boxes-pro', relpath)
            zipf.write(filepath, arcname)

print("Both ZIP packages generated successfully!")
