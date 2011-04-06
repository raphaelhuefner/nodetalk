#include <stdio.h>
#include <sys/time.h>
#include <sys/resource.h>
#include <unistd.h>
#include <errno.h>
#include <string.h> /* for errno translation */

/**
 * ulimiter
 *
 * Quick hack.  Increases number of allowed file
 * handles.  Must be run as root (probably as a setuid script).
 * @see http://www.cs.wisc.edu/condor/condorg/ulimiter.c
 */

/* Number of open files to increase to */
#define NEW_MAX (1000*1000)

/* UID */
#define UID 1000

int main()
{
	int ret;
	struct rlimit rl;

	if(getuid() != UID) {
		fprintf(stderr, "Only uid %d is allowed to run this\n", UID);
		return 1;
	}
	
	ret = getrlimit(RLIMIT_NOFILE, &rl);
	if(ret != 0) {
		fprintf(stderr, "Unable to read open file limit.\n"
				"(getrlimit(RLIMIT_NOFILE, &rl) failed)\n"
				"(%d, %s)", errno, strerror(errno));
		return 1;
	}

	fprintf(stderr, "Limit was %d (max %d), setting to %d\n",
			rl.rlim_cur, rl.rlim_max, NEW_MAX);

	rl.rlim_cur = rl.rlim_max = NEW_MAX;
	ret = setrlimit(RLIMIT_NOFILE, &rl);
	if(ret != 0) {
		fprintf(stderr, "Unable to set open file limit.\n"
				"(setrlimit(RLIMIT_NOFILE, &rl) failed)\n"
				"(%d, %s)", errno, strerror(errno));
		return 1;
	}

	ret = getrlimit(RLIMIT_NOFILE, &rl);
	if(ret != 0) {
		fprintf(stderr, "Unable to read new open file limit.\n"
				"(getrlimit(RLIMIT_NOFILE, &rl) failed)\n"
				"(%d, %s)", errno, strerror(errno));
		return 1;
	}
	if(rl.rlim_cur < NEW_MAX) {
		fprintf(stderr, "Failed to set new open file limit.\n"
				"Limit is %d, expected %d\n",
				rl.rlim_cur, NEW_MAX);
		return 1;
	}

	fprintf(stderr, "Success\n");
	return 0;
}
