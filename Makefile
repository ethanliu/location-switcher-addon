.PHONY: firefox chrome icon

firefox:
	@./build.sh firefox
	@./build.sh firefox-advanced

chrome:
	@./build.sh chrome

icon:
	@./build.sh icon
