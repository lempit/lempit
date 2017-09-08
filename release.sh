#!/bin/bash

version=$1
echo

read -p "Are you sure want to release version $version? (y/n)" -n 1 -r
if [[ $REPLY =~ ^[Yy]$ ]]
then
	echo
  echo "Releasing $version ..."

	# merge from dev branch
	git merge dev
	
	# stage all changes and commit
	git commit -am "v$version"

	# update npm version 
	# commit also tagged here
	npm version $version --message "Release version $version"

	# push to repo
	git push origin master --tags
	echo
	echo "$"
	echo "Done! - don't forget to publish npm after release done on github."
fi