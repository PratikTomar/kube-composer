# Docker Setup Instructions for Kube Composer

Since the GitHub Actions workflow file cannot be automatically pushed, please follow these steps to manually add Docker support to your repository.

## 📁 Files to Create Manually

### 1. Create `.github/workflows/docker-build.yml`

In your GitHub repository, create this file path: `.github/workflows/docker-build.yml`

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  DOCKER_IMAGE: same7ammar/kube-composer
  DOCKER_REGISTRY: docker.io

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Log in to Docker Hub
      if: github.event_name != 'pull_request'
      uses: docker/login-action@v3
      with:
        registry: ${{ env.DOCKER_REGISTRY }}
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}

    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.DOCKER_IMAGE }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}

    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        platforms: linux/amd64,linux/arm64
        push: ${{ github.event_name != 'pull_request' }}
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

    - name: Image digest
      if: github.event_name != 'pull_request'
      run: echo ${{ steps.build.outputs.digest }}

  security-scan:
    runs-on: ubuntu-latest
    needs: build-and-push
    if: github.event_name != 'pull_request'
    
    steps:
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: ${{ env.DOCKER_IMAGE }}:latest
        format: 'sarif'
        output: 'trivy-results.sarif'

    - name: Upload Trivy scan results to GitHub Security tab
      uses: github/codeql-action/upload-sarif@v2
      if: always()
      with:
        sarif_file: 'trivy-results.sarif'
```

## 🔧 Setup Steps

### Step 1: Add Docker Hub Secrets
1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add these repository secrets:
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub access token (not password!)

### Step 2: Create Docker Hub Access Token
1. Go to [Docker Hub](https://hub.docker.com/)
2. Click your profile → **Account Settings**
3. Go to **Security** → **New Access Token**
4. Create a token with **Read, Write, Delete** permissions
5. Copy this token and use it as `DOCKER_PASSWORD` secret

### Step 3: Manual File Creation Options

#### Option A: GitHub Web Interface
1. Go to your repository on GitHub
2. Click **Add file** → **Create new file**
3. Type `.github/workflows/docker-build.yml` as the filename
4. Paste the YAML content above
5. Commit the file

#### Option B: Local Git Commands
```bash
# In your local repository
mkdir -p .github/workflows
cat > .github/workflows/docker-build.yml << 'EOF'
[paste the YAML content here]
EOF

git add .github/workflows/docker-build.yml
git commit -m "Add Docker CI/CD workflow"
git push origin feat/Adding-docker-support
```

## 🚀 What This Enables

Once set up, the workflow will:

- ✅ **Automatically build** Docker images on every push to main
- ✅ **Multi-platform support** (AMD64 + ARM64)
- ✅ **Security scanning** with Trivy
- ✅ **Push to Docker Hub** as `same7ammar/kube-composer`
- ✅ **Tag management** (latest, branch names, commit SHAs)

## 🐳 Using the Docker Image

Once the workflow runs, users can use your containerized app:

```bash
# Pull and run the latest version
docker run -p 8080:80 same7ammar/kube-composer:latest

# Access at http://localhost:8080
```

## 📝 Notes

- The workflow only pushes images on pushes to `main` branch
- Pull requests will build but not push images
- Security scans are uploaded to GitHub Security tab
- Images are cached for faster builds

## 🔍 Verification

After setup, check:
1. **Actions tab** in your GitHub repo for workflow runs
2. **Docker Hub** for published images
3. **Security tab** for vulnerability scan results

---

**Need Help?** Check the Actions tab for any workflow errors and ensure all secrets are properly configured.