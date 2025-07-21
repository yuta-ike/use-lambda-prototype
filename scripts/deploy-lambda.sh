#!/bin/bash

set -e

export AWS_REGION=ap-northeast-1
export AWS_ENDPOINT_URL=http://localhost:4566

# Deploy Lambda functions
if [ -d "./dist/lambda" ]; then
  echo "Deploying Lambda functions..."
  cd ./dist/lambda

  for file in */index.mjs; do
    if [ -f "$file" ]; then
      dir_name=$(dirname "$file")
      function_name=$(basename "$dir_name")
      cd "$dir_name"
      zip -q "../$function_name.zip" "index.mjs"
      cd ..
      
      if aws lambda --endpoint-url http://localhost:4566 get-function --function-name "$function_name" >/dev/null 2>&1; then
        echo "Update function code for existing function: $function_name"
        aws lambda --endpoint-url http://localhost:4566 update-function-code \
          --function-name "$function_name" \
          --zip-file "fileb://$function_name.zip" >/dev/null
        echo "Updated function code for: $function_name"
      else
        echo "Creating new function: $function_name"
        aws lambda --endpoint-url http://localhost:4566 create-function \
          --function-name "$function_name" \
          --runtime nodejs22.x \
          --role arn:aws:iam::000000000000:role/lambda-role \
          --handler "index.handler" \
          --zip-file "fileb://$function_name.zip" \
          --timeout 30 >/dev/null
        echo "Created function: $function_name"
      fi
      
      rm "$function_name.zip"
    fi
  done
else
  echo "Error: ./dist/lambda directory does not exist. Please build the Lambda functions first."
fi

echo "Deployment process completed!"
