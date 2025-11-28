const TermsOfServicePage = () => {
	return (
		<div className='min-h-screen bg-white pt-24 pb-16'>
			<div className='max-w-4xl mx-auto px-6 py-8'>
				<div className='mb-8'>
					<h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
						Terms of Service
					</h1>
					<p className='text-gray-600 text-sm'>
						Last updated:{" "}
						{new Date().toLocaleDateString("en-US", {
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</p>
				</div>

				<div className='prose prose-lg max-w-none'>
					<div className='mb-8 text-gray-700 leading-relaxed'>
						<p className='mb-4'>
							These Terms of Service ("<strong>Terms</strong>")
							constitute an agreement governing the use of the
							Services (defined below) provided by Puzzle Labs,
							Inc. ("<strong>Puzzle</strong>") to the organization
							identified in the applicable Order Form or that
							otherwise accesses the Services ("
							<strong>Customer</strong>"). This Agreement is
							effective as of the date of an applicable signed
							Order Form or, if earlier, the date upon which
							Customer first accesses the Services (as applicable,
							the "<strong>Effective Date</strong>").
						</p>
						<p className='mb-4'>
							By clicking a box or otherwise indicating your
							acceptance of these Terms, by executing an Order
							Form or other contract that references these Terms,
							by purchasing Services or otherwise entering into an
							Order Form or other contract with Puzzle for the
							purchase of Services or under which Services are
							made available to you, or by otherwise accessing
							and/or using the Services, whichever is earlier, you
							accept and agree to be bound by these Terms. If you
							do not agree to these Terms or you are not
							authorized to access and/or use the Services, you
							shall not access or use the Services.
						</p>
						<p>
							If you are accessing and/or using the Services on
							behalf of a company (such as your employer) or other
							legal entity, you agree to these Terms on behalf of
							such company or other legal entity, and you
							represent and warrant that you have the authority to
							bind such company or other legal entity to these
							Terms.
						</p>
					</div>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							1. SERVICES AND SUPPORT
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							<div>
								<h3 className='text-lg font-semibold text-gray-900 mb-2'>
									1.1 Services
								</h3>
								<p>
									Customer may obtain from Puzzle the right to
									access and use the software, platforms and
									other technology made available by Puzzle
									for purchase or use by its customers (the "
									<strong>Services</strong>") pursuant to the
									terms of this Agreement. The Services
									include, but are not limited to, AI-powered
									video summarization, automatic subtitle
									generation, multi-platform export
									capabilities, and related features.
								</p>
							</div>
							<div>
								<h3 className='text-lg font-semibold text-gray-900 mb-2'>
									1.2 Rights
								</h3>
								<p>
									Subject to the terms of this Agreement,
									Puzzle grants Customer during the applicable
									Subscription Term (as defined below) a
									non-exclusive, non-sublicensable,
									non-transferable right to access and use the
									Services in accordance with this Agreement
									and Puzzle's published product documentation
									("
									<strong>Documentation</strong>").
								</p>
							</div>
							<div>
								<h3 className='text-lg font-semibold text-gray-900 mb-2'>
									1.3 Support; SLA
								</h3>
								<p>
									While under valid license, Puzzle will
									provide Customer with (i) technical support
									services in accordance with the terms set
									forth in Exhibit A; and (ii) the commitments
									in the Service Level Agreement in Exhibit B.
								</p>
							</div>
							<div>
								<h3 className='text-lg font-semibold text-gray-900 mb-2'>
									1.4 Authorized Users
								</h3>
								<p>
									Customer will not allow any person other
									than Authorized Users to access or use the
									Services. Customer may authorize any
									employee or contractor of Customer to access
									or use the Services (each an "
									<strong>Authorized User</strong>") on behalf
									of Customer, provided that (i) such use,
									including the number of Authorized Users,
									does not exceed any restrictions or limits
									in the Order Form, if applicable; and (ii)
									Customer is responsible for acts or
									omissions by Authorized Users in connection
									with their use of the Services as if made by
									Customer itself. Each account for the
									Services may only be accessed and used by
									the specific Authorized User for whom such
									account is created.
								</p>
							</div>
							<div>
								<h3 className='text-lg font-semibold text-gray-900 mb-2'>
									1.5 Third-Party Services
								</h3>
								<p>
									Certain features and functionalities within
									the Services may allow Customer and its
									Authorized Users to interface or interact
									with, access and/or use compatible
									third-party services, products, technology
									and content (collectively, "
									<strong>Third-Party Services</strong>")
									through the Services. Puzzle makes no
									representations or warranties regarding
									Third-Party Services. Customer is solely
									responsible for (i) maintaining the
									Third-Party Services; (ii) obtaining any
									associated licenses and consents necessary
									to use the Third-Party Services in
									connection with the Services; and (iii) the
									interoperation and configuration of any
									Third-Party Services with Customer's use of
									the Services.
								</p>
							</div>
							<div>
								<h3 className='text-lg font-semibold text-gray-900 mb-2'>
									1.6 Evaluation Services; Beta Services
								</h3>
								<p>
									Puzzle may grant Customer access to the
									Services on a trial, proof-of-concept, or
									evaluation basis (the "
									<strong>Evaluation Services</strong>") or on
									an alpha, preview, early access, or beta
									basis ("<strong>Beta Services</strong>").
									Customer may only use the Evaluation
									Services for Customer's internal evaluation
									purposes. Notwithstanding any other
									provision of this Agreement, EVALUATION
									SERVICES AND BETA SERVICES ARE PROVIDED BY
									PUZZLE "AS-IS" AND WITHOUT ANY
									REPRESENTATIONS, WARRANTIES, PERFORMANCE,
									DATA SECURITY GUARANTEES, OR SUPPORT OR
									INDEMNITY OBLIGATIONS.
								</p>
							</div>
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							2. RESTRICTIONS AND RESPONSIBILITIES
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							<div>
								<h3 className='text-lg font-semibold text-gray-900 mb-2'>
									2.1 Restrictions
								</h3>
								<p className='mb-2'>
									Customer will not, directly or indirectly:
								</p>
								<ul className='list-disc list-inside space-y-2 ml-4'>
									<li>
										reverse engineer, decompile, disassemble
										or otherwise attempt to discover the
										source code, object code or underlying
										structure, ideas, know-how or algorithms
										relevant to the Services or any
										software, documentation or data related
										to the Services ("
										<strong>Software</strong>");
									</li>
									<li>
										modify, translate, or create derivative
										works based on the Services or any
										Software (except to the extent expressly
										permitted by Puzzle in writing);
									</li>
									<li>
										sell, assign, lease sublicense, or
										otherwise transfer the Services or
										Software, in whole or in part, to any
										third party without Puzzle's prior
										written consent;
									</li>
									<li>
										use the Services or any Software for
										timesharing or service bureau purposes
										or otherwise for the benefit of a third
										party;
									</li>
									<li>
										remove any proprietary notices or
										labels;
									</li>
									<li>
										interfere with or disrupt the integrity
										or performance of the Services, Software
										or data contained therein;
									</li>
									<li>
										attempt to gain unauthorized access to
										the Services, Software or its related
										systems or networks; or
									</li>
									<li>
										use the Services or Customer Data in a
										manner that infringes, misappropriates,
										or otherwise violates any third party's
										rights or violates laws and regulations.
									</li>
								</ul>
							</div>
							<div>
								<h3 className='text-lg font-semibold text-gray-900 mb-2'>
									2.2 Customer Equipment
								</h3>
								<p>
									Customer shall be responsible for obtaining
									and maintaining any equipment and ancillary
									services needed to connect to, access or
									otherwise use the Services, including,
									without limitation, modems, hardware,
									servers, software, operating systems,
									networking, web servers and the like
									(collectively, "<strong>Equipment</strong>
									"). Customer shall also be responsible for
									maintaining the security of the Equipment,
									Customer account, Customer's access
									credentials and files, and for all uses of
									Customer account or the Equipment with or
									without Customer's knowledge or consent.
								</p>
							</div>
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							3. FEES AND PAYMENT
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							<div>
								<h3 className='text-lg font-semibold text-gray-900 mb-2'>
									3.1 Fees
								</h3>
								<p>
									Customer will pay Puzzle the fees set forth
									in the applicable Order Form ("
									<strong>Fees</strong>"). All Fees are
									non-refundable except as otherwise expressly
									set forth in this Agreement. All Fees are
									exclusive of applicable taxes, duties,
									levies, tariffs, and other governmental
									charges (collectively, "
									<strong>Taxes</strong>"). Customer is
									responsible for payment of all Taxes,
									excluding Taxes based on Puzzle's income,
									property, or employees.
								</p>
							</div>
							<div>
								<h3 className='text-lg font-semibold text-gray-900 mb-2'>
									3.2 Payment Terms
								</h3>
								<p>
									Unless otherwise set forth in the applicable
									Order Form, all Fees are due and payable
									within thirty (30) days of the invoice date.
									If Customer fails to pay any Fees when due,
									Puzzle may suspend Customer's access to the
									Services until such Fees are paid in full.
								</p>
							</div>
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							4. CONFIDENTIALITY
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							<p>
								Each party (the "
								<strong>Receiving Party</strong>") understands
								that the other party (the "
								<strong>Disclosing Party</strong>") has
								disclosed or may disclose business, technical or
								financial information relating to the Disclosing
								Party's business (hereinafter referred to as "
								<strong>Proprietary Information</strong>" of the
								Disclosing Party). Proprietary Information of
								Puzzle includes non-public information regarding
								features, functionality and performance of the
								Services. Proprietary Information of Customer
								includes non-public data provided by Customer to
								Puzzle to enable the provision of the Services
								("<strong>Customer Data</strong>"). The
								Receiving Party agrees: (i) to take reasonable
								precautions to protect such Proprietary
								Information, and (ii) not to use (except in
								performance of the Services or as otherwise
								permitted herein) or divulge to any third person
								any such Proprietary Information.
							</p>
							<p>
								The Disclosing Party agrees that the foregoing
								shall not apply with respect to any information
								after five (5) years following the disclosure
								thereof or any information that the Receiving
								Party can document (a) is or becomes generally
								available to the public, or (b) was in its
								possession or known by it prior to receipt from
								the Disclosing Party, or (c) was rightfully
								disclosed to it without restriction by a third
								party, or (d) was independently developed
								without use of any Proprietary Information of
								the Disclosing Party or (e) is required to be
								disclosed by law.
							</p>
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							5. INTELLECTUAL PROPERTY RIGHTS
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							<p>
								Except as expressly set forth herein, Puzzle
								alone (and its licensors, where applicable) will
								retain all intellectual property rights relating
								to the Services or any suggestions, ideas,
								enhancement requests, feedback, recommendations
								or other information provided by Customer, any
								Authorized User, or any third party relating to
								the Services, which are hereby assigned to
								Puzzle. Customer will not copy, modify,
								distribute, sell, or lease any part of our
								Services or included software, nor will Customer
								reverse engineer or attempt to extract the
								source code of that software.
							</p>
							<p>
								Customer and its Authorized Users will retain
								all right, title and interest in and to Customer
								Data. Customer hereby grants Puzzle a
								non-exclusive, worldwide, royalty-free, fully
								paid-up right and license to use, reproduce,
								perform, display, and distribute Customer Data
								solely for the purpose of providing the Services
								to Customer.
							</p>
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							6. INDEMNIFICATION
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							<p>
								Puzzle will defend, indemnify, and hold harmless
								Customer from and against any and all claims,
								damages, obligations, losses, liabilities, costs
								or debt, and expenses (including but not limited
								to attorney's fees) arising from: (i) a third
								party claim that the Services, when used in
								accordance with this Agreement, infringe or
								misappropriate such third party's intellectual
								property rights; or (ii) Puzzle's breach of its
								confidentiality obligations hereunder.
							</p>
							<p>
								Customer will defend, indemnify, and hold
								harmless Puzzle from and against any and all
								claims, damages, obligations, losses,
								liabilities, costs or debt, and expenses
								(including but not limited to attorney's fees)
								arising from: (i) Customer's or any Authorized
								User's use of the Services in violation of this
								Agreement; (ii) Customer Data or Customer's
								combination of the Services with any hardware,
								software, products, data or other materials not
								provided by Puzzle; or (iii) any claim that
								Customer Data or Customer's use of the Services
								infringes or misappropriates any third party's
								intellectual property rights.
							</p>
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							7. WARRANTY DISCLAIMER
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							<p>
								THE SERVICES AND SOFTWARE ARE PROVIDED "AS IS"
								AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND,
								EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED
								TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY,
								FITNESS FOR A PARTICULAR PURPOSE, AND
								NON-INFRINGEMENT. PUZZLE DOES NOT WARRANT THAT
								THE SERVICES WILL BE UNINTERRUPTED, ERROR-FREE,
								OR COMPLETELY SECURE.
							</p>
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							8. LIMITATION OF LIABILITY
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							<p>
								NOTWITHSTANDING ANYTHING TO THE CONTRARY, EXCEPT
								FOR BODILY INJURY OF A PERSON, PUZZLE AND ITS
								SUPPLIERS (INCLUDING BUT NOT LIMITED TO ALL
								EQUIPMENT AND TECHNOLOGY SUPPLIERS), OFFICERS,
								AFFILIATES, REPRESENTATIVES, CONTRACTORS AND
								EMPLOYEES SHALL NOT BE RESPONSIBLE OR LIABLE
								WITH RESPECT TO ANY SUBJECT MATTER OF THIS
								AGREEMENT OR TERMS AND CONDITIONS RELATED
								THERETO UNDER ANY CONTRACT, NEGLIGENCE, STRICT
								LIABILITY OR OTHER THEORY: (A) FOR ERROR OR
								INTERRUPTION OF USE OR FOR LOSS OR INACCURACY OR
								CORRUPTION OF DATA OR COST OF PROCUREMENT OF
								SUBSTITUTE GOODS, SERVICES OR TECHNOLOGY OR LOSS
								OF BUSINESS; (B) FOR ANY INDIRECT, EXEMPLARY,
								INCIDENTAL, SPECIAL OR CONSEQUENTIAL DAMAGES;
								(C) FOR ANY MATTER BEYOND PUZZLE'S REASONABLE
								CONTROL; OR (D) FOR ANY AMOUNTS THAT, TOGETHER
								WITH AMOUNTS ASSOCIATED WITH ALL OTHER CLAIMS,
								EXCEED THE FEES PAID BY CUSTOMER TO PUZZLE FOR
								THE SERVICES UNDER THIS AGREEMENT IN THE 12
								MONTHS PRIOR TO THE ACT THAT GAVE RISE TO THE
								LIABILITY, IN EACH CASE, WHETHER OR NOT PUZZLE
								HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH
								DAMAGES.
							</p>
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							9. TERM AND TERMINATION
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							<div>
								<h3 className='text-lg font-semibold text-gray-900 mb-2'>
									9.1 Term
								</h3>
								<p>
									This Agreement commences on the Effective
									Date and continues until terminated in
									accordance with this Section 9. The initial
									term of the Services subscription will be as
									set forth in the applicable Order Form (the
									"<strong>Initial Term</strong>"). Unless
									otherwise stated in the Order Form, the
									subscription will automatically renew for
									successive periods of the same duration as
									the Initial Term (each, a "
									<strong>Renewal Term</strong>", and together
									with the Initial Term, the "
									<strong>Subscription Term</strong>") unless
									either party provides written notice of
									non-renewal at least thirty (30) days prior
									to the end of the then-current Subscription
									Term.
								</p>
							</div>
							<div>
								<h3 className='text-lg font-semibold text-gray-900 mb-2'>
									9.2 Termination
								</h3>
								<p>
									Either party may terminate this Agreement
									(i) for convenience upon thirty (30) days'
									written notice to the other party, or (ii)
									immediately upon written notice if the other
									party materially breaches this Agreement and
									such breach is not cured within thirty (30)
									days after written notice of such breach.
								</p>
							</div>
							<div>
								<h3 className='text-lg font-semibold text-gray-900 mb-2'>
									9.3 Effect of Termination
								</h3>
								<p>
									Upon termination of this Agreement,
									Customer's right to access and use the
									Services will immediately cease. Puzzle will
									make Customer Data available to Customer for
									export for a period of thirty (30) days
									after termination. After such period, Puzzle
									may delete Customer Data in accordance with
									its standard retention policies.
								</p>
							</div>
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							10. GENERAL PROVISIONS
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							<div>
								<h3 className='text-lg font-semibold text-gray-900 mb-2'>
									10.1 Entire Agreement
								</h3>
								<p>
									This Agreement, together with all Order
									Forms, constitutes the entire agreement
									between the parties and supersedes all prior
									and contemporaneous agreements, proposals or
									representations, written or oral, concerning
									its subject matter.
								</p>
							</div>
							<div>
								<h3 className='text-lg font-semibold text-gray-900 mb-2'>
									10.2 Governing Law
								</h3>
								<p>
									This Agreement shall be governed by the laws
									of the State of Delaware without regard to
									its conflict of laws provisions. All claims
									arising out of or relating to this Agreement
									will be brought exclusively in the federal
									or state courts located in New Castle
									County, Delaware.
								</p>
							</div>
							<div>
								<h3 className='text-lg font-semibold text-gray-900 mb-2'>
									10.3 Assignment
								</h3>
								<p>
									Neither party may assign or otherwise
									transfer this Agreement or any rights or
									obligations hereunder without the written
									consent of the other party, except that
									either party may, without such consent,
									assign or transfer this Agreement in its
									entirety to an Affiliate or a purchaser of
									all or substantially all of its assets or to
									a successor organization by merger,
									consolidation, change of control, conversion
									or otherwise.
								</p>
							</div>
							<div>
								<h3 className='text-lg font-semibold text-gray-900 mb-2'>
									10.4 Force Majeure
								</h3>
								<p>
									Neither party will be liable for any delay
									or failure to perform its obligations
									hereunder (other than any obligation to make
									a payment) resulting from any cause beyond
									such party's reasonable control, including
									pandemic, weather, fire, floods, labor
									disputes, riots or civil disturbances, acts
									of government, and acts of war or terrorism.
								</p>
							</div>
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							EXHIBIT A - SUPPORT TERMS
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							<p>
								Puzzle will provide technical support for the
								Services to Customer via email and through our
								support portal on weekdays during the hours of
								9:00 am through 5:00 pm Pacific time, with the
								exclusion of Federal Holidays ("
								<strong>Support Hours</strong>").
							</p>
							<p>
								Customer may initiate a helpdesk ticket during
								Support Hours by emailing support@puzzle.com or
								through the support portal available in the
								Services.
							</p>
							<p>
								Puzzle will use commercially reasonable efforts
								to respond to all helpdesk tickets within one
								(1) business day.
							</p>
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							EXHIBIT B - SERVICE LEVEL AGREEMENT
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							<p>
								Puzzle shall use all commercially reasonable
								efforts to ensure that the Services are
								available to Customer 99.9% of the time in any
								calendar month. The availability calculation
								excludes any downtime resulting from: (i)
								scheduled or emergency maintenance; (ii)
								Customer's breach of this Agreement, (iii) acts
								or omissions of Customer, its Affiliates, or its
								or their Authorized Users, (iv) Third-Party
								Services; (v) outages of third-party connections
								or utilities or other reasons beyond Puzzle's
								control.
							</p>
							<p>
								Customer's sole and exclusive remedy, and
								Puzzle's entire liability, in connection with
								Service availability shall be that for each
								period of downtime lasting longer than one hour,
								Puzzle will credit Customer 5% of monthly
								Service fees for each period of 30 or more
								consecutive minutes of downtime; provided that
								no more than one such credit will accrue per
								day. Such credits would be issued as a credit
								against Customer's next invoice payable, may not
								be redeemed for cash, and the aggregate maximum
								service credit payable in any given month is 25%
								of the monthly Services fees.
							</p>
							<p>
								In order to receive downtime credit, Customer
								must notify Puzzle in writing within 24 hours
								from the time of downtime, and failure to
								provide such notice will forfeit the right to
								receive downtime credit.
							</p>
						</div>
					</section>

					<div className='mt-12 pt-8 border-t border-gray-200'>
						<p className='text-gray-600 text-sm'>
							If you have any questions about these Terms of
							Service, please contact us at{" "}
							<a
								href='mailto:legal@puzzle.com'
								className='text-blue-600 hover:text-blue-800 underline'
							>
								legal@puzzle.com
							</a>
							.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

TermsOfServicePage.displayName = "TermsOfServicePage";
export default TermsOfServicePage;
